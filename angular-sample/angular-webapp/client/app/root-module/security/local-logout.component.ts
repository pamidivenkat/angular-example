import { CookieService } from 'ngx-cookie';
import { StorageService } from './../../shared/services/storage.service';
import { AuthorizationService } from '../../shared/security/authorization.service';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'local-logout',
    template: `<div>Local Logout</div>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class LocalLogout implements OnInit {
    constructor(
        private _authorizationService: AuthorizationService
        , private _storageService: StorageService
        , private _cookieService: CookieService
    ) { }

    ngOnInit() {
        this._storageService.remove('identity');
        this._cookieService.remove('token');
        this._authorizationService.SignOut();
    }
}