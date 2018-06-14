import { AuthorizationService } from '../../shared/security/authorization.service';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'auth-callback',
    template: `<div>Auth Callback</div>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AuthCallback implements OnInit {
    constructor(private _authorizationService: AuthorizationService) { }

    ngOnInit() {
        if (window.location.hash) {
            this._authorizationService.AuthorizedCallback();
        }
    }
}