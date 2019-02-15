import { Component, OnInit } from "@angular/core";
import { takeUntil } from "rxjs/operators";

import { Advertisement } from "../../../core/models/post";
import { PostService } from "../../../core/services/post.service";
import { BaseComponent } from "../../base-component";

@Component({
  selector: "app-vendor-ads",
  templateUrl: "./vendor-ads.component.html",
  styleUrls: ["./vendor-ads.component.scss"]
})
export class VendorAdsComponent extends BaseComponent implements OnInit {
  // Private Fields
  // End of Private Fields

  // Public properties
  public vendorAd: Advertisement;
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(private _postService: PostService) {
    super();
    this.vendorAd = new Advertisement();
  }
  // End of constructor

  // Private methods
  // End of private methods

  // Public methods

  ngOnInit() {
    setTimeout(() => {
      this._postService
        .getAdvertisement()
        .pipe(takeUntil(this._destructor$))
        .subscribe((ad: Advertisement) => {
          this.vendorAd = ad;
        });
    }, 200);
  }
  // End of public methods
}
