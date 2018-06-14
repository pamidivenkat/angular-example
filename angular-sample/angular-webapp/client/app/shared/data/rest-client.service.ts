import { isNullOrUndefined } from 'util';
import { RouteParams } from '../services/route-params';
import { Store } from '@ngrx/store';
import { AuthConfig, IAuthConfig } from '../security/auth-config';
import { AuthorizationService } from '../security/authorization.service';
import { Observable } from 'rxjs/Rx';
import { Http, Headers, Response, HttpModule, Request, RequestMethod, RequestOptions, RequestOptionsArgs, URLSearchParams } from '@angular/http';
import { Injectable } from '@angular/core';
import * as fromRoot from '../reducers/index';
import * as fromConstants from '../app.constants';
import { StringHelper } from '../../shared/helpers/string-helper';

export class AuthHttpError extends Error {
}

@Injectable()
export class RestClientService {
  private _config: IAuthConfig;
  private _apiUrl: string;

  constructor(private http: Http,
    private _authService: AuthorizationService,
    options: AuthConfig,
    private _store: Store<fromRoot.State>,
    private _routeParams: RouteParams,
    private defOpts?: RequestOptions
  ) {
    this._config = options.getConfig();
    this._apiUrl = fromConstants.apiUrl;
  }

  private mergeOptions(providedOpts: RequestOptionsArgs, defaultOpts?: RequestOptions) {
    let newOptions = defaultOpts || new RequestOptions();
    if (this._config.globalHeaders) {
      this.setGlobalHeaders(this._config.globalHeaders, providedOpts);
    }

    newOptions = newOptions.merge(new RequestOptions(providedOpts));

    return newOptions;
  }

  private requestHelper(requestArgs: RequestOptionsArgs, additionalOptions?: RequestOptionsArgs): Observable<Response> {
    let options = new RequestOptions(requestArgs);

    if (additionalOptions) {
      options = options.merge(additionalOptions);
    }

    // append cid
    if (this._routeParams.Cid) {
      if (!options.search) {
        options.search = new URLSearchParams();
      }
      options.search.set("cid", this._routeParams.Cid)
    }

    return this.request(new Request(this.mergeOptions(options, this.defOpts)));
  }

  public setGlobalHeaders(headers: Array<Object>, request: Request | RequestOptionsArgs) {
    if (!request.headers) {
      request.headers = new Headers();
    }
    headers.forEach((header: Object) => {
      let key: string = Object.keys(header)[0];
      if (!request.headers.has(key)) {
        let headerValue: string = (header as any)[key];
        (request.headers as Headers).set(key, headerValue);
      }

    });
  }

  private requestWithToken(req: Request, token: string): Observable<Response> {
    if (!this._config.noClientCheck && !this._authService.IsAuthorized()) {
      if (!this._config.noJwtError) {
        return new Observable<Response>((obs: any) => {
          obs.error(new AuthHttpError('No JWT present or has expired'));
        });
      }
    } else {
      req.headers.set(this._config.headerName, this._config.headerPrefix + token);
    }

    return this.http.request(req);
  }

  public request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    if (typeof url === 'string') {
      return this.get(url, options); // Recursion: transform url from String to Request
    }

    let req: Request = url as Request;
    req.url = `${this._apiUrl}${req.url}`;
    let token: string = this._authService.GetToken();

    return this.requestWithToken(req, token);
  }

  public get(url: string, options?: RequestOptionsArgs): Observable<Response> {

    if (options && options.search) {
      let remove: string[] = [];
      (<URLSearchParams>options.search).paramsMap.forEach((values, key) => {
        if (isNullOrUndefined(values[0]) || values[0].toString() === '') {
          remove.push(key);
        }
      });
      remove.forEach((p) => (<URLSearchParams>options.search).paramsMap.delete(p));
    }

    return this.requestHelper({ body: '', method: RequestMethod.Get, url: url }, options);
  }

  public post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({ body: body, method: RequestMethod.Post, url: url }, options);
  }

  public put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({ body: body, method: RequestMethod.Put, url: url }, options);
  }

  public delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({ body: '', method: RequestMethod.Delete, url: url }, options);
  }

  public patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({ body: body, method: RequestMethod.Patch, url: url }, options);
  }

  public head(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({ body: '', method: RequestMethod.Head, url: url }, options);
  }

  public options(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({ body: '', method: RequestMethod.Options, url: url }, options);
  }
}