import { WebViewInterface } from "nativescript-webview-interface";

export class AppSettings {
    private _webViewStatus: string = "";
    private clearStatusCount = 0;

    public oWebViewInterface: WebViewInterface;
    public isLoggedIn: boolean = false;
    public loggedInUser: any = {};
    public expiringContent: number = 0;
    public notificationCount: number = 0;
    public publishedDate: string = '2018-7-19 11:47:05';
    public searchPhrase: string;
    public isLoading: boolean = true;
    public navigateTo: any;

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

    private static _instance: AppSettings;
    public static getInstance(): AppSettings {
        // Do you need arguments? Make it a regular method instead.
        return this._instance || (this._instance = new this());
        //if (this._instance)
        //    return this._instance;
        //else
        //    return this._instance = new AppSettings();
    }
}

