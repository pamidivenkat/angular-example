import { select } from "@angular-redux/store";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable } from "rxjs";
import { distinctUntilChanged, filter } from "rxjs/operators";

import { AuthenticationService } from "../core/services/authentication.service";
import { NativeScriptInterfaceService } from "./../shared/services/native-script-interface.service";
import { IdentityActions } from '../core/redux/actions/identity.actions';

const SIGNIN = 'Welcome to';
const SIGNOUT = 'You have been successfully signed out';

@Component({
    selector: "app-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
    // Private Fields
    private _returnUrl: string;
    private _loading: boolean;
    header = 'Welcome to'
    // End of Private Fields

    // Public properties
    @select(["identity", "isLoggedIn"])
    public isLoggedIn$: Observable<boolean>;
    user: {
        userName: string;
        password: string;
    } = { userName: null, password: null };

    get loading(): boolean {
        return this._loading;
    }

    // End of Public properties

    // Public Output bindings
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ContentChild bindings
    // End of Public ContentChild bindings

    constructor(
        private _route: ActivatedRoute,
        private _authService: AuthenticationService,
        private _router: Router,
        private nsInterfaceService: NativeScriptInterfaceService,
        private _identActions: IdentityActions)
    {}
    // End of constructor

    // Private methods
    // End of private methods

    // Public methods
    ngOnInit() {
        console.log(this._route.snapshot);
        this.header = this._route.snapshot.routeConfig.path === 'signin' ? SIGNIN : SIGNOUT;
        this._returnUrl = this._route.snapshot.queryParams["returnUrl"] || null;
        if (this._returnUrl){
            localStorage.setItem('returnUrl', this._returnUrl)
        }
        this.isLoggedIn$
            .pipe(
                distinctUntilChanged(),
                filter(isLoggedIn => isLoggedIn === true)
            )
            .subscribe(() => this._router.navigate(["/"]));

        this.nsInterfaceService.onLoginLoad(this.user);
        this.nsInterfaceService.nsService.subscribe((data: any) => {
            console.log(data);
        });

        this.nsInterfaceService.nsEventLister(
            {
                type: "nsLogin",
                object: this
            },
            function(that, event) {
                console.log("user", event);
                that.user = event;
                that.login();
            },
            function(that, error) {
                console.log("nsLoginEventLister ERROR: ", error);
            }
        );
    }

    login() {
        this._loading = true;
        this._authService.startAuthentication()
    }
    // End of public method
}
