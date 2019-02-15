import { select } from "@angular-redux/store";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { distinctUntilChanged, map, takeUntil } from "rxjs/operators";

import { PostType } from "../../core/models/post";
import { User } from "../../core/models/user";
import { ReviewService } from "../../core/services/review.service";
import { SnackbarService } from "../../core/services/snackbar.service";
import { BaseComponent } from "../../shared/base-component";

@Component({
  selector: "app-post-review-request",
  templateUrl: "./post-review-request.component.html",
  styleUrls: ["./post-review-request.component.scss"]
})
export class PostReviewRequestComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _user: User;
  // End of Private Fields

  // Public properties
  @Input()
  review;

  @Input()
  type;

  @Input()
  showBookMark;

  @select(["identity", "user"])
  User$: Observable<User>;
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(private _router: Router, private _reviewService: ReviewService, private _snackbar: SnackbarService) {
    super();
    this.showBookMark = true;

    this.User$.pipe(
      distinctUntilChanged(),
      map(u => u)
    ).subscribe(u => (this._user = u));
  }
  // End of constructor

  // Private methods
  // End of private methods

  // Public methods
  ngOnInit() {
    if (this.type === PostType.Inspection && this.review) {
      this.review.type = this.type;
      this.showBookMark = false;
    }
  }

  gotoAddReview(propertyId: number) {
    this._router.navigateByUrl(`/review/add?property=${propertyId}`);
  }

  gotoDetails() {
    let navigateUrl = "";
    switch (this.type) {
      case PostType.Review:
        navigateUrl = `/review/view/${this.review.reviewId}`;
        break;
      case PostType.Inspection:
        navigateUrl = `/inspection/${this.review.inspectionId}`;
        break;
      default:
        navigateUrl = `/property/${this.review.property.propertyId}`;
        break;
    }
    this._router.navigateByUrl(navigateUrl);
  }

  reRequest() {
    this._reviewService
      .reRequest(this.review.id)
      .pipe(takeUntil(this._destructor$))
      .subscribe(response => {
        if (response instanceof HttpErrorResponse) {
          this._snackbar.error(response.statusText);
        } else {
          this._snackbar.success("Re-Request successful");
        }
      });
  }

  canShowReRequest(): boolean {
    return !this.type && this._user.id === this.review.createdBy;
  }

  getLocation(): string {
    let location = [
      this.review.property.propertyAddress,
      this.review.property.cityName,
      this.review.property.stateName,
      this.review.property.propertyZip,
      this.review.property.countryName
    ];
    return location.filter(part => part).join(", ");
  }
  // End of public methods
}
