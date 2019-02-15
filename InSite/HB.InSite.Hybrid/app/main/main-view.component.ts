import {
    AfterContentInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    NgZone,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef
} from "@angular/core";
import { Page } from 'tns-core-modules/ui/page';
import { WebView } from "ui/web-view";
import { SearchBar } from "ui/search-bar";
import { RadSideDrawerComponent, SideDrawerType } from "nativescript-ui-sidedrawer/angular";
import * as bghttp from "nativescript-background-http";
import { Switch } from "ui/switch";
import "rxjs/Rx";
import { appSettingsWVInterface } from '../core/webviewInterface/app-settings';
import { environment } from "~/app.constants";
import { DrawerTransitionBase, SlideInOnTopTransition } from "nativescript-ui-sidedrawer";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs/operators";
import { AppSettings } from "~/core/models/app-settings";
import { Store } from '@ngrx/store';
import { State } from '~/core/redux';
import { LoadConfig, UserLoaded } from '~/core/redux/config.actions';
import { WebViewService } from '~/core/web-view/webview.service';
import * as fs from 'file-system';

@Component({
    selector: "main-view",
    templateUrl: "./main/main-view.component.html"
})
export class MainViewComponent implements OnInit, AfterContentInit, OnDestroy {
    @ViewChild("myWebView") webViewRef: ElementRef;
    @ViewChild(RadSideDrawerComponent) public drawerComponent: RadSideDrawerComponent;
    private _sideDrawerTransition: DrawerTransitionBase;
    private _drawer: SideDrawerType;
    private _page: Page;
    private _webViewStatus: string = "";
    private hasBackButton: boolean = false;
    private _hasSearchField: boolean = false;
    private showFilePicker: boolean;
    private clearStatusCount = 0;
    private chooseFileOption: any;
    private postOption;
    private venueOption;
    public session = bghttp.session("image-upload");
    public task: bghttp.Task;

    public loggedInUser: any = AppSettings.getInstance().loggedInUser;

    public searchPhrase: string;
    public isVenueOption: boolean = true;
    public baseUrl: string = environment.webAppUrl;
    public webviewComp: WebView;
    public instance: MainViewComponent;

    constructor(
        page: Page,
        private viewContainerRef: ViewContainerRef,
        private zone: NgZone,
        private router: Router,
        private _cdr: ChangeDetectorRef,
        private store: Store<State>,
        private webService: WebViewService
    ) {
        console.log("mainview component page");
        this.instance = this;
        this._page = page;
        page.actionBarHidden = true;
        page.on("loaded", this.onLoaded, this);
    }

    ngOnInit() {
        this.listenWebViewEvents();
        this.store.dispatch(new LoadConfig());
        this.router.events
            .pipe(filter((event: any) => event instanceof NavigationEnd))
            .subscribe((e) => {
                if (e instanceof NavigationEnd) {
                    this._drawer.closeDrawer();
                }
            });
    }

    public get sideDrawerTransition(): DrawerTransitionBase {
        return this._sideDrawerTransition;
    }

    public toggleSideMenu(isOpen) {
        console.log('side menu click', this._drawer._cssState);
        isOpen === null ? this._drawer.toggleDrawerState() : isOpen ? this._drawer.showDrawer() : this._drawer.closeDrawer();
    }

    public onLoaded(args) {
        this._sideDrawerTransition = new SlideInOnTopTransition();
    }

    public get hasSearchField() {
        return this._hasSearchField;
    }

    public set hasSearchField(value: boolean) {
        this._hasSearchField = value;
    }

    public get webViewStatus() {
        return this._webViewStatus;
    }

    public set webViewStatus(value: string) {
        this._webViewStatus = value;
        if (this.webViewStatus !== "") {
            this.clearStatusCount += 1;
            setTimeout(() => {
                if (this.clearStatusCount <= 1) {
                    this.webViewStatus = "";
                    this.clearStatusCount = 0;
                } else {
                    this.clearStatusCount -= 1;
                }
            }, 3000);
        }
        console.log("WEBVIEW MESSAGE - " + value);
    }

    ngAfterContentInit() {
        console.log('After Init Called');
        this.webService.initialize(this.webViewRef);

        this.showFilePicker = false;
        this._drawer = this.drawerComponent.sideDrawer;
        this._cdr.detectChanges();
    }

    ngOnDestroy() {
        this.webService.destroy();
    }

    public venueOptionChange(args: any) {
        this.venueOption = <Switch>args.object;
        if (this.postOption) {
            this.postOption.checked = !this.venueOption.checked;
        }
    }

    public postOptionChange(args: any) {
        this.postOption = <Switch>args.object;
        if (this.venueOption) {
            this.venueOption.checked = !this.postOption.checked;
        }
    }


    public onWebViewLoaded(webargs: any) {
        const page = webargs.object.page;
        const vm = page.bindingContext;
        this.webviewComp = webargs.object;
    }

    /**
     * Handles any event/command emitted by webview.
     */
    private listenWebViewEvents() {
        // handles setting selectionChange event.
        this.webService.navigationEnd$.subscribe((event) => {
            console.log('WEBVIEW INTERFACE - NavigationEnd - ' + JSON.stringify(event));
            if (this.webService.webview && this.webService.webview.nativeView && this.webService.webview.nativeView.getOriginalUrl) {
                this.webService.webURL = this.webService.webview.nativeView.getOriginalUrl();
            }//this._webURL == this.baseUrl || 
            if (event.url == '/')
                this.hasBackButton = false;
            else
                this.hasBackButton = true;
            console.log('webURL: ' + this.webService.webURL);
            if (this._drawer && this._drawer.closeDrawer)
                this._drawer.closeDrawer();
            this._cdr.detectChanges();
        });

        this.webService.settingsChanged$.subscribe((obj) => {
            console.log('WEBVIEW INTERFACE - settingsChanged - ' + obj);
            appSettingsWVInterface.settings = obj;
            this._cdr.detectChanges();
        });
        this.webService.loadSettingsNS$.subscribe((value) => {
            console.log('WEBVIEW INTERFACE - loadSettingsNS - ' + JSON.stringify(value));
            AppSettings.getInstance().isLoggedIn = true;
            this.loggedInUser = value;
            this.store.dispatch(new UserLoaded(value));
            this.loadSettingsInWebView();
            this._cdr.detectChanges();
        });
        this.webService.onload$.subscribe((value) => {
            console.log('WEBVIEW INTERFACE - onloaded - ' + value);
            this._cdr.detectChanges();
            this.loadSettingsInWebView();
        });
        this.webService.fileUpload$.subscribe((value) => {
            console.log('WEBVIEW INTERFACE - fileUpload - ' + JSON.stringify(value));
            //this._cdr.detectChanges();
            // this.showFilePicker = true;
            this._cdr.detectChanges();
            this.chooseFileOption = {
                context: {
                    startPath: fs.knownFolders.documents().path,
                    maxSize: 1000000,
                    extensions: [],
                    ignoreExtensions: []
                },
                viewContainerRef: this.viewContainerRef
            };
        });
    }

    public navigateTo(url) {
        this.webService.navigateTo(url)
    }

    /**
     * Sends events to webView, once web page is loaded
     */
    private loadSettingsInWebView() {
        console.log('Load Setting Emit');
        this.webService.emit('loadSettingsNS', appSettingsWVInterface.initSettings);
    }

    public goBack() {
        this.webService.goBack();
    }

    public showNotification(args: any) {
        this.navigateTo('notifications');
        this.webViewStatus = "Loading notifications";
    }

    public showSearch() {
        this.hasSearchField = !this.hasSearchField;
    }

    public pageBack(args: any) {
        this.webService.pageBack(args)
    }

    public onSearch(args: any) {
        let searchBar = <SearchBar>args.object;
        this.webViewStatus = "Loading search results for " + searchBar.text;
        this.navigateTo('/search/results');
        this.showSearch();
    }

    public onSearchLoaded(args: any) {
        // console.log("onSearchLoaded - ");
    }

    public onSearchClear(args: any) {
        // console.log("onSearchClear - ");
    }

    public onSelectedFile(res) {
        console.log(res);
        this.showFilePicker = false;
        this._cdr.detectChanges();
        if (res)
            this.fileUploadbghttp(environment.fileUploadUrl, fs.File.fromPath(res));
    }

    fileUploadbghttp(url, file) {
        var request = {
            url: url,
            method: "POST",
            description: "{ 'uploading': " + file.name + " }"
        };

        var params = [
            { name: "upload", filename: file.path }
        ];
        this.task = this.session.multipartUpload(params, request);

        this.task.on("progress", this.logEvent);
        this.task.on("error", this.logEvent);
        this.task.on("complete", (event) => {
            console.log("successfully uploaded file");
            this.webService.emit('selectedFile', JSON.parse(event['response'].getBodyAsString()));
        });
    }

    logEvent(e) {
        console.log("currentBytes: " + e.currentBytes);
        console.log("totalBytes: " + e.totalBytes);
        console.log("eventName: " + e.eventName);
        if (e.eventName == 'error') {
            alert("Error uploading file");
            console.log(e);
        }
    }

    extractFileName(fileUri) {
        var pattern = /[^/]*$/;
        var imageName = fileUri.match(pattern);
        return imageName;
    }
}
