import {
    AfterContentInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild
} from "@angular/core";
import { Page } from 'tns-core-modules/ui/page';
import { Router } from "@angular/router";
import { distinctUntilChanged } from "rxjs/operators";
import { RadSideDrawerComponent } from "nativescript-ui-sidedrawer/angular/side-drawer-directives";
import { DrawerTransitionBase, SlideInOnTopTransition } from "nativescript-ui-sidedrawer";
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { State } from '~/core/redux';
import { WebViewService } from '~/core/web-view/webview.service';
import { TNSFontIconService } from 'nativescript-ngx-fonticon/services/fonticon.service';
import { RemoteNotifications, RemoteNotificationsConsumer } from "~/core/interfaces/notifications";
import { FirebaseRemoteNotifications } from "~/app.notifications";
import { NotificationCount } from '~/core/redux/config.actions';
import { isAndroid } from "platform";

class RemoteNotificationsListener implements RemoteNotificationsConsumer {
    constructor(private webService: WebViewService) {
    }

    messageReceived(message: any): void {
        console.log(`Remote notifications received: ${JSON.stringify(message)}`);
        let timeoutValue = 500;
        const inForeground = message['foreground'];
        
        if (isAndroid && inForeground) {
            return;
        }

        if (isAndroid) {
            timeoutValue = 7000;
        }
        setTimeout(() => this.webService.navigateTo('notifications'), timeoutValue);
        this.webService.webViewStatus = "Loading notifications";
    }
}


@Component({
    selector: "app-header",
    styleUrls: ['./layout/header/app-header.component.scss'],
    templateUrl: "./layout/header/app-header.component.html"
})
export class AppHeaderComponent implements OnInit, AfterContentInit {
    @Input() hasBackButton: boolean = false;
    @Output() toggle: EventEmitter<boolean> = new EventEmitter<boolean>(false);
    @ViewChild(RadSideDrawerComponent) public drawerComponent: RadSideDrawerComponent;
    private _sideDrawerTransition: DrawerTransitionBase;
    private readonly _remoteNotifications: RemoteNotifications;
    private _userTopic: string;
    public expiringContent: number = 0;
    public notificationCount: number = 0;

    public hasSearchField: boolean = false;
    public isLoggedIn$: Observable<boolean>;
    public expiringContent$: Observable<number>;
    public notificationCount$: Observable<number>;
    isLoggedIn = false;

    constructor(
        private _page: Page,
        private _router: Router,
        private _cdr: ChangeDetectorRef,
        private fonticon: TNSFontIconService,
        private store: Store<State>,
        private webService: WebViewService,
        remoteNotifications: FirebaseRemoteNotifications
    ) {
        console.log("app header component");
        _page.actionBarHidden = true;
        _page.on("loaded", this.onLoaded, this);
        this._remoteNotifications = remoteNotifications;
    }

    ngOnInit() {
        this.store.pipe(select((s => s.config), distinctUntilChanged())).subscribe(config => {
            console.log(`Logged In: ${config.isLoggedIn}`);
            this.isLoggedIn = config.isLoggedIn;
            if (this.isLoggedIn && config.user && !this._userTopic) {
                this._userTopic = config.user.id;
                this._remoteNotifications.subscribe(this._userTopic);
                console.log(`Subscribed To Topic: ${this._userTopic}`);
            } else if (!this.isLoggedIn && this._userTopic) {
                this._remoteNotifications.unsubscribe(this._userTopic);
                console.log(`Unsubscribed From Topic: ${this._userTopic}`);
                this._userTopic = null;
            }
            this._cdr.detectChanges();
        });

        this.isLoggedIn$ = this.store.pipe(select(s => s.config.isLoggedIn));
        this.store.pipe(select(s => s.config.expiringContent)).subscribe(ex => {
            this.expiringContent = ex;
            this._cdr.detectChanges()
        });
        this.store.pipe(select(s => s.config.notificationCount)).subscribe(n => {
            this.notificationCount = n;
            this._cdr.detectChanges()
        });
        setTimeout(() => this._cdr.detectChanges(), 5000);

        this._remoteNotifications.startListening(new RemoteNotificationsListener(this.webService));
    }

    ngAfterContentInit() {

    }

    ngOnDestroy() {
    }

    public toggleSideMenu() {
        this.toggle.emit(null)
    }

    public onLoaded(args) {
        this._sideDrawerTransition = new SlideInOnTopTransition();
    }

    public onLogoClick() {
        this.webService.navigateTo('');
    }

    public showNotification(args: any) {
        this.webService.navigateTo('notifications');
        this.webService.webViewStatus = "Loading notifications";
        this.store.dispatch(new NotificationCount(0))
    }

    public searchBarEvent(event: any) {
        this.webService.navigateTo(`/search/results/${event.venue ? 'property' : 'searchText'}/${event.text}`);
        console.log('searchBarEvent' + event);
    }

    public pageBack(args: any) {
        this.webService.pageBack(args)
    }

}
