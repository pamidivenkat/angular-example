import { IFrameWindow } from './iframe-window';
import { isNullOrUndefined } from 'util';
import {
    RefreshTokenAction,
    ResetOAuthDataAction,
    SetOAuthNonceAction,
    SetOAuthTokenAction,
} from '../actions/identity.actions';
import * as fromConstants from '../app.constants';
import { JWTHelper } from '../helpers/jwt-helper';
import { Identity } from '../models/identity';
import * as fromRoot from '../reducers/index';
import { StorageService } from '../services/storage.service';
import { AuthorizationEffects } from './../effects/authorization.effects';
import { AuthConfig, IAuthConfig } from './auth-config';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Observable, Observer, Subscription } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Headers, Http, Request, RequestMethod, RequestOptions } from '@angular/http';
import { CookieService } from 'ngx-cookie';


@Injectable()
export class AuthorizationService {

    // Private fields
    private _userIdentity$: Observable<Identity>;
    private _userIdentity: Identity;
    private _config: IAuthConfig;
    private _headers: Headers;
    private _appUrl: string;
    private _stsUrl: string;
    private _timer: any;
    private _timerSub: Subscription;
    private _expiryTime: Date;
    private _refreshInProgress: boolean = false;
    private _refreshBeforeInMins: number = 5;
    // End of Private fields

    // Constructor
    constructor(private _http: Http
        , private _router: Router
        , private _store: Store<fromRoot.State>
        , private _authConfig: AuthConfig
        , private _storage: StorageService
        , private _cookieService: CookieService
        , private _authAfftects: AuthorizationEffects) {
        this._appUrl = fromConstants.appUrl;
        this._stsUrl = fromConstants.stsURL;
        this._config = _authConfig.getConfig();
        this._timer = Observable.timer(5000, 5000);
        this._userIdentity$ = this._store.let(fromRoot.getUserIdentity);
        this._userIdentity$.subscribe(userIdentity => {
            this._userIdentity = userIdentity;
            this._refreshInProgress = false;
            this._expiryTime = JWTHelper.getTokenExpirationDate(this._userIdentity.token);
            if (!isNullOrUndefined(this._timerSub)) {
                this._timerSub.unsubscribe();
            }
            this._timerSub = this._timer.subscribe(() => {
                this._refreshTimerCallback();
            });
        });
    }
    // End of Constructor

    // Private methods
    private getUserData = (): Observable<string[]> => {
        this.setHeaders();
        return this._http.get(this._stsUrl + '/connect/userinfo', {
            headers: this._headers,
            body: ''
        }).map(res => res.json());
    }

    private setHeaders(token: string = null) {
        this._headers = new Headers;
        if (!this._config.globalHeaders) {
            this._config.globalHeaders.forEach((header: Object) => {
                let key: string = Object.keys(header)[0];
                let headerValue: string = (header as any)[key];
                this._headers.set(key, headerValue);
            });
        }

        if (!token) {
            token = this.GetToken();
        }

        if (token !== '') {
            this._headers.append('Authorization', 'Bearer ' + token);
        }
    }

    private refreshTokenSetter(res: any) {
        res = res.json();

        if (!res || !res[this._config.refreshTokenName] || !res[this._config.tokenName]) {
            this.ResetAuthorizationData();

            return false;
        }
        this.SetAuthorizationData(res[this._config.tokenName], res[this._config.refreshTokenName])

        return true;
    }

    private _setRefreshing(value: boolean) {
        this._store.dispatch(new RefreshTokenAction(value));
    }

    private _refreshTimerCallback() {
        if (!this._refreshInProgress && !isNullOrUndefined(this._expiryTime) &&
            ((Date.now() + this._refreshBeforeInMins * 60 * 1000) >= this._expiryTime.valueOf())) {
            this._refreshTheToken();
            this._refreshInProgress = true;
            if (this._timerSub) {
                this._timerSub.unsubscribe();
            }
        }
    }

    private _refreshTheToken() {
        let authorizationUrl = this._stsUrl + '/identity/connect/authorize';
        let client_id = 'atlas2angularwebapp';
        let redirect_uri = this._appUrl + '/silentauthcallback.html';
        let response_type = 'id_token token';
        let scope = 'atlascore openid';
        let nonce = 'N' + Math.random() + '' + Date.now();
        let state = Date.now() + '' + Math.random();

        let url = authorizationUrl + '?' +
            'response_type=' + encodeURI(response_type) + '&' +
            'client_id=' + encodeURI(client_id) + '&' +
            'redirect_uri=' + encodeURI(redirect_uri) + '&' +
            'scope=' + encodeURI(scope) + '&' +
            'nonce=' + encodeURI(nonce) + '&' +
            'state=' + encodeURI(state) + '&prompt=none';

        let iframeWin = new IFrameWindow();

        iframeWin.navigate({ url: url }).then((responseUrl: string) => {
            let result: any = responseUrl.split('#')[1].split('&').reduce(function (result, item) {
                let parts = item.split('=');
                result[parts[0]] = parts[1];
                return result;
            }, {});

            this.SetAuthorizationData(result.access_token, result.id_token, null);
        }, (error) => {
            console.log(error);
        });


    }
    // End of Private methods

    // Public methods
    public IsAuthorized(): boolean {
        if (this._userIdentity && this._userIdentity.token) {
            if (JWTHelper.isTokenExpired(this._userIdentity.token)) {
                this.ResetAuthorizationData();
                return false;
            }

            return true;
        }

        return false;
    }

    public ResetAuthorizationData() {
        this._store.dispatch(new ResetOAuthDataAction(true));
    }

    public Authorize(url: string) {
        // this.ResetAuthorizationData();

        let authorizationUrl = this._stsUrl + '/identity/connect/authorize';
        let client_id = 'atlas2angularwebapp';
        let redirect_uri = this._appUrl + '/authcallback.html';
        let response_type = "id_token token";
        let scope = "atlascore openid";
        let nonce = 'N' + Math.random() + "" + Date.now();
        let state = Date.now() + '' + Math.random();

        // this._store.dispatch(new SetOAuthNonceAction(new Identity(null, null, nonce, state, url)));
        this._cookieService.remove('token');
        this._storage.set('identity', new Identity(null, null, nonce, state, url));
        url =
            authorizationUrl + '?' +
            'response_type=' + encodeURI(response_type) + '&' +
            'client_id=' + encodeURI(client_id) + '&' +
            'redirect_uri=' + encodeURI(redirect_uri) + '&' +
            'scope=' + encodeURI(scope) + '&' +
            'nonce=' + encodeURI(nonce) + '&' +
            'state=' + encodeURI(state);

        window.location.href = url;
    }

    public SetAuthorizationData(token: any, id_token: any, url: string = null) {
        this._store.dispatch(new SetOAuthTokenAction(new Identity(token, id_token, null, null, url)));
    }

    public AuthorizedCallback() {
        let hash = window.location.hash.substr(1);

        let result: any = hash.split('&').reduce(function (result: any, item: string) {
            let parts = item.split('=');
            result[parts[0]] = parts[1];
            return result;
        }, {});

        let token = '';
        let id_token = '';
        let authResponseIsValid = false;

        if (!result.error) {
            if (result.state !== this._userIdentity.state) {
                console.log('AuthorizedCallback incorrect state');
            } else {

                token = result.access_token;
                id_token = result.id_token;

                let dataIdToken: any = JWTHelper.getDataFromToken(id_token);

                // validate nonce
                if (dataIdToken.nonce !== this._userIdentity.nonce) {
                    console.log('AuthorizedCallback incorrect nonce');
                } else {
                    this.ResetAuthorizationData();

                    authResponseIsValid = true;
                }
            }
        }

        if (authResponseIsValid) {
            this.SetAuthorizationData(token, id_token, this._userIdentity.url);

            // Navigate
            //this._router.navigate([this._userIdentity.url]);
        } else {
            this.ResetAuthorizationData();
            this._router.navigate(['/Unauthorized']);
        }
    }

    public GetToken(): any {
        return this._userIdentity.token;
    }

    public SignOut() {
        let authorizationUrl = this._stsUrl + '/identity/connect/endsession';

        let id_token_hint = this._userIdentity.idToken;
        let post_logout_redirect_uri = this._appUrl;

        let url =
            authorizationUrl + '?' +
            'id_token_hint=' + encodeURI(id_token_hint) + '&' +
            'post_logout_redirect_uri=' + encodeURI(post_logout_redirect_uri);

        this.ResetAuthorizationData();

        window.location.href = url;
    }
    // End of Public methods
}