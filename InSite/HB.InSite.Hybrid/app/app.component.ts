import { Page } from 'tns-core-modules/ui/page';
import { Component, OnInit } from "@angular/core";
// import { isAndroid } from "platform";
// import { Observable } from 'rxjs';

// setup notification source for both platforms
// let OnNotification: Observable<string>;
// if (isAndroid) {
//     console.log(`Called Android Intent Activity`);
//     OnNotification = require("./activity").OnIntent;
// }

@Component({
    selector: "ns-app",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
    title = "HB InSite";

    constructor(page: Page) {
        console.log('app component page value: ');
        // OnNotification.subscribe(i => console.log('OnNotification', i));
    }

    ngOnInit() {
    }
}
