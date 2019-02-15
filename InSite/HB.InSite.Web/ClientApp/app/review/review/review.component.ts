import { select } from "@angular-redux/store";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxGalleryImage, NgxGalleryOptions } from "ngx-gallery";
import { Observable } from "rxjs";
import { distinctUntilChanged, filter, takeUntil } from "rxjs/operators";

import { Review } from "../../core/models/review";
import { ClaimsHelperService } from "../../core/services/claims-helper.service";
import { ReviewService } from "../../core/services/review.service";
import { SnackbarService } from "../../core/services/snackbar.service";
import { BaseComponent } from "../../shared/base-component";
import * as constants from "./../../app.constants";

@Component({
  selector: "app-review",
  templateUrl: "./review.component.html",
  styleUrls: ["./review.component.scss"]
})
export class ReviewComponent extends BaseComponent implements OnInit {
  private _review: Review;
  private _isLoading: boolean = false;
  private _isCVB: boolean = false;
  private _isMobile: boolean;

  public isEditable: boolean = false;
  public consts;
  public filePath: string;
  public galleryOptions: NgxGalleryOptions[];
  public galleryImages: NgxGalleryImage[];

  get isLoading(): boolean {
    return this._isLoading;
  }
  get review() {
    return this._review;
  }
  get isCVB(): boolean {
    return this._isCVB;
  }
  get isMobile(): boolean {
    return this._isMobile;
  }

  @select(["layout", "isMobile"])
  isMobile$: Observable<boolean>;

  @select(["settings", "values"])
  private _settings$: Observable<Array<any>>;

  constructor(
    private _reviewService: ReviewService,
    private _claimsHelper: ClaimsHelperService,
    private _activatedRoute: ActivatedRoute,
    private _snackbar: SnackbarService,
    private _router: Router
  ) {
    super();
    this.consts = constants;
    this._review = new Review();
  }

  ngOnInit() {
    this.galleryOptions = [
      {
        width: "600px",
        height: "400px",
        thumbnailsColumns: 4
      },
      { image: false, height: "100px" },
      { breakpoint: 500, width: "100%" }
    ];

    this._settings$
      .pipe(
        takeUntil(this._destructor$),
        filter(setting => setting !== null)
      )
      .subscribe(settings => {
        this.filePath =
          settings.find(setting => setting.name === "BlobStorage:Path").value +
          "/" +
          settings.find(setting => setting.name === "BlobStorage:Container").value +
          "/";
      });

    this.isMobile$.pipe(distinctUntilChanged()).subscribe(value => {
      this._isMobile = value ? true : false;
    });
    this._isLoading = true;
    this._activatedRoute.params
      .pipe(takeUntil(this._destructor$))
      .switchMap(params => {
        return this._reviewService.getReviewById(params.id, true);
      })
      .subscribe(data => {
        this._isLoading = false;
        if (data instanceof HttpErrorResponse) {
          this._snackbar.error("There is no active review available");
        } else {
          this._review = data;
          this._review.createdOn = this._review.createdOn ? this._review.createdOn : new Date().toString();

          this._review.property.location = [
            this._review.property.propertyAddress,
            this._review.property.cityName,
            this._review.property.stateName,
            this._review.property.propertyZip,
            this._review.property.countryName
          ]
            .filter(part => part)
            .join(", ");

          this.galleryImages = [];
          let attachments = [];
          this._review.attachments.map(attachment => {
            if (attachment.isImage) {
              this.galleryImages.push({
                small: this.filePath + attachment.fileIdentifier,
                big: this.filePath + attachment.fileIdentifier,
                medium: this.filePath + attachment.fileIdentifier
              });
            } else {
              attachments.push(attachment);
            }
          });

          this._review.attachments = attachments;

          this._isCVB =
            this._review.property.propertyChainId === 100325 && this._review.property.isInternalOnly === false;

          this.isEditable = this._claimsHelper.canEditEntity(this._review.createdBy);
        }
      });
  }

  editReview() {
    if (this.review.postType !== "C") {
      this._router.navigateByUrl(`/review/update/${this.review.reviewId}`);
    } else {
      this._router.navigateByUrl(`/postreview/update/${this.review.reviewId}`);
    }
  }
}
