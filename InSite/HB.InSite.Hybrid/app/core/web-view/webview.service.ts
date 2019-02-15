import { ElementRef, Injectable } from '@angular/core';
import { LoadEventData, WebView } from "ui/web-view";
import { WebViewInterface } from 'nativescript-webview-interface';
import { Store } from '@ngrx/store';
import { State } from '~/core/redux';
import { environment } from '~/app.constants';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { filter, map } from 'rxjs/operators';
import {
    ExpiringContent,
    HeaderCounts,
    NotificationCount,
    PublishedDate,
    UserLoaded,
    UserUnloaded
} from '~/core/redux/config.actions';
import { MyWebChromeClient } from '~/core/web-view/webclient';
import { fromEvent } from "rxjs";

@Injectable()
export class WebViewService {
    public isSetup = false;
    public webview: WebView;
    public webViewEl: ElementRef;
    public oWebViewInterface: WebViewInterface;
    public events$: BehaviorSubject<{ type: string; payload: any }> = new BehaviorSubject({
        type: 'init',
        payload: null
    });
    clearStatusCount = 0;
    _webViewStatus: string = '';
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

    public webURL: string = '';

    private mapHelper = (type) => this.events$.pipe(filter(ev => ev.type === type), map(ev => ev.payload));

    public loadSettingsNS$ = this.mapHelper('loadSettingsNS');
    public navigationEnd$ = this.mapHelper('NavigationEnd');
    public notificationCount$ = this.mapHelper('notificationCount');
    public expiringContent$ = this.mapHelper('expiringContent');
    public headerCounts$ = this.mapHelper('headerCounts');
    public publishedDate$ = this.mapHelper('publishedDate');
    public onload$ = this.mapHelper('onload');
    public settingsChanged$ = this.mapHelper('settingsChanged');
    public onLoginLoad$ = this.mapHelper('onLoginLoad');
    public fileUpload$ = this.mapHelper('fileUpload');

    constructor(public store: Store<State>) {
        this.oWebViewInterface = null;
        this.webURL = environment.webAppUrl;
        this.reduxDispatching();
        this.events$.subscribe(ev => console.log('***WEB EVENT**', ev));
    }

    initialize(webViewEl: ElementRef) {
        console.log('Init');
        this.webViewEl = webViewEl;
        this.webview = webViewEl.nativeElement as WebView;
        this.oWebViewInterface = new WebViewInterface(this.webview, this.webURL);
        this.deviceConfig();
        this.listenWebViewEvents();
        // handling WebView load finish event
        fromEvent<LoadEventData>(this.webview, WebView.loadFinishedEvent)
            .subscribe((args: LoadEventData) => {
                const webView = <WebView>args.object;
                if (webView.android && !args.error) {
                    this.oWebViewInterface && this.oWebViewInterface.emit('loadSettingsNS', {});
                }
            });
        this.webview.on(WebView.loadStartedEvent, this.onWebViewStarted);
        this.webview.on(WebView.loadFinishedEvent, this.onWebViewFinished);
        this.isSetup = true;
    }

    deviceConfig() {
        // console.log('IsAndroid?', this.webview.android);
        // if (this.webview.android) {
        //     const client = new MyWebChromeClient();
        //     this.webview.android.setWebChromeClient(client);
        // }
    }

    emit(type: string, object: any) {
        this.oWebViewInterface.emit(type, object)
    }

    listen(type) {
        this.oWebViewInterface.on(type, this.nextEvent(this, type))
    }

    nextEvent(that, type) {
        return (payload) => that.events$.next({ type, payload })
    }

    goBack() {
        if (this.webview.canGoBack) {
            this.webview.goBack();
        }
    }

    pageBack(args: any) {
        if (this.webview.canGoBack) {
            this.webview.goBack();
        } else {
            this.webview.reload();
        }
    }

    navigateTo(url) {
        this.emit('nsroute', `/${url}`);
    }

    destroy() {
        this.isSetup = false;
        this.oWebViewInterface.destroy();
    }

    private listenWebViewEvents() {
        this.listen('NavigationEnd');
        this.listen('notificationCount');
        this.listen('expiringContent');
        this.listen('headerCounts');
        this.listen('publishedDate');
        this.listen('loadSettingsNS');
        this.listen('onload');
        this.listen('settingsChanged');
        // this.listen('onLoginLoad');
        this.listen('fileUpload');
    }

    private onWebViewStarted(args: LoadEventData) {
        this.webViewStatus = args.error ? `Error loading: ${args.url}:${args.error}` : `Loading: ${args.url}`;
        // const webView = <WebView>args.object;
        const webView = <WebView>args.object;
        if (webView.android) {
            let mWebSettings = webView.nativeView.getSettings();
            mWebSettings.setLoadWithOverviewMode(true);
            mWebSettings.setDomStorageEnabled(true);
            mWebSettings.setJavaScriptEnabled(true);
            mWebSettings.setDatabaseEnabled(true);
            mWebSettings.setSupportZoom(false);
            mWebSettings.setAllowFileAccess(true);
            mWebSettings.setAllowContentAccess(true);
        }//Mobile/1A543a Safari/419.3");
    }

    private onWebViewFinished(args: LoadEventData) {
        let message;
        let url;
        let webView;
        webView = <WebView>args.object;
        url = webView.nativeView && webView.nativeView.getOriginalUrl ? webView.nativeView.getOriginalUrl() : args.url;
        this.webURL = url;

        if (!args.error) {
            message = "loaded " + url;
        } else {
            message = "Error loading " + url + ": " + args.error;
            webView.goBack();
        }

        if (webView.android) {
            const client = new MyWebChromeClient();
            webView.android.setWebChromeClient(client);
        } else {
            webView.ios.scrollView.minimumZoomScale = 1.0;
            webView.ios.scrollView.maximumZoomScale = 1.0;
            webView.ios.scalesPageToFit = false;
            webView.ios.scrollView.bounces = false;
        }

        this.webViewStatus = message;
    }

    private reduxDispatching() {
        this.notificationCount$
            .subscribe(count => this.store.dispatch(new NotificationCount(count)));

        this.expiringContent$
            .subscribe(count => this.store.dispatch(new ExpiringContent(count)));

        this.headerCounts$
            .subscribe(count => this.store.dispatch(new HeaderCounts(count)));

        this.publishedDate$
            .subscribe((date) => this.store.dispatch(new PublishedDate(date)));

        this.loadSettingsNS$
            .subscribe(u => this.store.dispatch(new UserLoaded(u)));

        this.onLoginLoad$
            .subscribe(() => this.store.dispatch(new UserUnloaded()));
    }
}