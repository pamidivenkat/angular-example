import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { TNSFontIconService } from 'nativescript-ngx-fonticon/services/fonticon.service';
import { Page } from 'tns-core-modules/ui/page';
import { State } from '~/core/redux';
import { select, Store } from '@ngrx/store';
import { WebViewService } from '~/core/web-view/webview.service';
import { Observable } from 'rxjs';
import { State as ConfigState } from '~/core/redux/config.reducer';
import { UserUnloaded } from '~/core/redux/config.actions';
import { tap } from 'rxjs/operators';

@Component({
    selector: "navigation-drawer",
    styleUrls: ['./layout/navigation-drawer/navigation-drawer.component.scss'],
    templateUrl: "./layout/navigation-drawer/navigation-drawer.component.html"
})
export class NavigationDrawerComponent implements AfterViewInit {

    loggedInUser: any = {};
    isLoggedIn$: Observable<boolean>;
    publishDate$: Observable<string>;
    config$: Observable<ConfigState>;
    @Output() close: EventEmitter<boolean> = new EventEmitter(false);

    constructor(page: Page, private fonticon: TNSFontIconService, private store: Store<State>, private webService: WebViewService, private _cdr: ChangeDetectorRef) {
        this.store.pipe(select((s => s.config.user)))
            .subscribe(u => this.loggedInUser = u);
        this.isLoggedIn$ = this.store.pipe(select((s => s.config.isLoggedIn)));
        this.config$ = this.store.pipe(select(s => s.config));
    }

    public ngAfterViewInit() {
        this.store.pipe(select(s => s.config)).subscribe((c) => this._cdr.detectChanges());
    }

    public navigateTo(route: string) {
        console.log("Navigate to ", route);
        if (route == "signOut") {
            this.webService.emit('nsLogout', this.loggedInUser);
            this.store.dispatch(new UserUnloaded());
        } else {
            this.webService.navigateTo(route);
        }
        this.close.emit(true)
    }
}
