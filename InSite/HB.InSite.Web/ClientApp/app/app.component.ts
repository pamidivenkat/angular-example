import { Component, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";

import { RouterExtService } from "./core/services/router-ext.service";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"]
})
export class AppComponent implements OnInit {
  constructor(private _router: Router, private _routerExtService: RouterExtService) {}

  ngOnInit() {
    //Remove all local storage on app load.
    localStorage.removeItem("previousUrl");
    localStorage.removeItem("homeFilter");
    localStorage.removeItem("searchFilters");
    localStorage.removeItem("postFeedTab");
    localStorage.removeItem("scrollPosition");

    this._router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Store current and its previous url to find the home page and restore the filters.
        let previousUrlArray = localStorage.getItem("previousUrl")
          ? localStorage.getItem("previousUrl").split("$")
          : [];

        let perviousUrl = this._routerExtService.getPreviousUrl();

        let index = perviousUrl ? perviousUrl.indexOf("/auth-callback") : 0;
        localStorage.setItem("previousUrl", previousUrlArray[1] + "$" + (index >= 0 ? "/" : perviousUrl));

        const hasGoToPath = this._router.url.indexOf("#");

        if (hasGoToPath === -1 && this._router.url !== "/") {
          //Go to top of the page except home page.
          window.scrollTo(0, 0);
        }
      }
    });
  }
}
