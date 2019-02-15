import { select } from "@angular-redux/store";
import { Location } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, HostListener, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatAutocompleteSelectedEvent, MatDialog } from "@angular/material";
import { ActivatedRoute, Params } from "@angular/router";
import { Observable, of as observableOf } from "rxjs";
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil } from "rxjs/operators";

import { Property } from "../../core/models/property";
import { Review } from "../../core/models/review";
import { User } from "../../core/models/user";
import { LayoutActions } from "../../core/redux/actions/layout.actions";
import { ClaimsHelperService } from "../../core/services/claims-helper.service";
import { PropertyService } from "../../core/services/property.service";
import { ReviewService } from "../../core/services/review.service";
import { SnackbarService } from "../../core/services/snackbar.service";
import { UserService } from "../../core/services/user.service";
import { BaseComponent } from "../../shared/base-component";
import { ModelDialogComponent } from "../../shared/components/model-dialog/model-dialog.component";
import * as constants from "./../../app.constants";

@Component({
  selector: "app-post-review",
  templateUrl: "./post-review.component.html",
  styleUrls: ["./post-review.component.scss"]
})
export class PostReviewComponent extends BaseComponent implements OnInit {
  private _user: User;
  private _isSaved: boolean = false;

  public propertyControl: FormControl;
  public filteredProperties: Observable<any[]>;
  public propertyLoader: boolean = false;
  public selectedProperty: Property;
  public properties: Array<any>;
  public postForm: FormGroup;
  public review: Review;
  public consts;
  public params: Params;
  public maxStartDate: Date;
  public isEditable: boolean = false;
  public minExpirationDate: Date;
  public associateNames: Array<string> = [];
  public isMobile: boolean = false;

  get isSaved(): boolean {
    return this._isSaved;
  }

  @select(["identity", "user"])
  user$: Observable<User>;

  @select(["settings", "values"])
  settings$: Observable<Array<any>>;

  @select(["layout", "isMobile"])
  isMobile$: Observable<boolean>;

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    if (!this._user) {
      this._layoutActions.toggleMobile(event.target.innerWidth < 1024);
    }
  }

  constructor(
    private _propertyService: PropertyService,
    public _reviewService: ReviewService,
    private _fb: FormBuilder,
    private _snackbar: SnackbarService,
    private _activatedRoute: ActivatedRoute,
    private _userService: UserService,
    private _location: Location,
    private _claimsHelper: ClaimsHelperService,
    private _dialog: MatDialog,
    private _layoutActions: LayoutActions
  ) {
    super();
    this.maxStartDate = new Date();
    this.consts = constants;
    this.propertyControl = new FormControl();
    this.properties = [];
    this.selectedProperty = new Property();
    this.review = new Review();
    this.params = {};
    this.minExpirationDate = new Date();

    this.filteredProperties = this.propertyControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(value => {
        const trimmedValue: string = value ? value.trim() : "";
        if (trimmedValue.length >= 3) {
          this.propertyLoader = true;
          return this._getPropertiesByName(value);
        } else {
          return observableOf([]);
        }
      })
    );

    this.isMobile$.pipe(distinctUntilChanged()).subscribe(value => {
      this.isMobile = value ? true : false;
    });
  }

  private _initForm() {
    this.postForm = this._fb.group({
      propertyControl: "",
      organizationName: "",
      programName: "",
      programStartDate: "",
      associates: "",
      fullName: "",
      numberOfAttendees: "",
      detailedReview: "",
      bServiceQuality: "",
      serviceQuality: "",
      bVenueCondition: "",
      venueCondition: "",
      bFbQuality: "",
      fbQuality: "",
      overallExperience: "",
      bOverallExperience: "",
      hbAssociateFeedBack: "",
      testimonial: "",
      bResponseTimeliness: "",
      responseTimeliness: "",
      bHbFriendliness: "",
      hbFriendliness: "",
      bDestinationKnowledge: "",
      destinationKnowledge: "",
      isRecommended: "",
      isApproved: "",
      expirationDate: "",
      showOnInsite: ""
    });
  }

  private _getPropertiesByName(searchText: string) {
    return this._propertyService.searchProperties(searchText).pipe(
      map(response => {
        this.properties = [];

        //Remove CVB from list.
        let filteredList = response.value.filter(
          property => !(property.propertyChainId == 100325 && property.isInternalOnly == false)
        );

        filteredList.map(property => {
          if (property.propertyID !== this.selectedProperty.propertyId) {
            this.properties.push({
              propertyId: property.propertyID,
              propertyName: property.venue,
              propertyChainId: property.propertyChainId,
              propertyChainName: property.venueBrand,
              locationId: property.locationId,
              location: property.location,
              isInternalOnly: property.isInternalOnly
            });
          }
        });
        this.propertyLoader = false;
        return this.properties;
      })
    );
  }

  private _setVenue(id: number) {
    this.propertyLoader = true;
    this._propertyService
      .getPropertyById(id)
      .pipe(takeUntil(this._destructor$))
      .subscribe(venue => {
        this.propertyLoader = false;
        this.selectedProperty = venue;
      });
  }

  private _getAssociateDetails(associateIds) {
    this._userService
      .getUsersByAssociateIds(associateIds)
      .pipe(
        filter(user => user),
        takeUntil(this._destructor$)
      )
      .subscribe((users: Array<User>) => {
        users.map(user => {
          this.associateNames.push(`${user.firstName} ${user.lastName}`);
        });
        this.postForm.get("associates").setValue(this.associateNames.join(", "));
      });
  }

  ngOnInit() {
    this.user$.pipe(takeUntil(this._destructor$)).subscribe(user => {
      this._user = user;
      this.isEditable = this._user ? this._claimsHelper.canEditEntity(this._user.id) : true;
    });
    this._initForm();
    let reviewId = +this._activatedRoute.snapshot.paramMap.get("id");

    if (reviewId) {
      this._reviewService
        .getReviewById(reviewId, true)
        .pipe(takeUntil(this._destructor$))
        .subscribe(review => {
          this.review = review;

          this.postForm.get("associates").setValue(this.review.associates);
          this.postForm.get("organizationName").setValue(this.review.organizationName);
          this._setVenue(this.review.propertyId);
          this.postForm.get("programName").setValue(this.review.programName);
          this.postForm.get("programStartDate").setValue(this.review.programStartDate);
          this.postForm.get("fullName").setValue(this.review.fullName);
          this.postForm.get("numberOfAttendees").setValue(this.review.numberOfAttendees);
          this.postForm.get("detailedReview").setValue(this.review.detailedReview);
          this.postForm.get("serviceQuality").setValue(this.review.serviceQuality);
          this.postForm.get("bServiceQuality").setValue(this.review.bServiceQuality);
          this.postForm.get("bVenueCondition").setValue(this.review.bVenueCondition);
          this.postForm.get("venueCondition").setValue(this.review.venueCondition);
          this.postForm.get("bFbQuality").setValue(this.review.bFbQuality);
          this.postForm.get("fbQuality").setValue(this.review.fbQuality);
          this.postForm.get("bOverallExperience").setValue(this.review.bOverallExperience);
          this.postForm.get("overallExperience").setValue(this.review.overallExperience);
          this.postForm.get("isRecommended").setValue(this.review.isRecommended);
          this.postForm.get("testimonial").setValue(this.review.testimonial);
          this.postForm.get("hbAssociateFeedBack").setValue(this.review.hbAssociateFeedBack);
          this.postForm.get("expirationDate").setValue(this.review.expirationDate);
          this.postForm.get("showOnInsite").setValue(this.review.showOnInsite);
          this.postForm.get("isApproved").setValue(this.review.isApproved);
          this.postForm.markAsDirty();
        });
    } else {
      this._activatedRoute.queryParams.pipe(takeUntil(this._destructor$)).subscribe(params => {
        this.params = params;
        Object.keys(params).map(key => {
          switch (key) {
            case "AssociateID":
              this._getAssociateDetails(params[key].trim());
              break;
            case "ClientName":
              this.postForm.get("organizationName").setValue(params[key]);
              break;
            case "EventDate":
              this.postForm.get("programStartDate").setValue(new Date(params[key]));
              break;
            case "EventName":
              this.postForm.get("programName").setValue(params[key]);
              break;
            case "propertyid":
              this._setVenue(params[key]);
              break;
          }
        });
      });
    }

    this.settings$.pipe(distinctUntilChanged()).subscribe(settings => {
      if (settings) {
        const expirationMonths = settings.find(setting => setting.name === "Expiration:Review").value;

        let expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + +expirationMonths);
        this.postForm.get("expirationDate").setValue(expirationDate);
      }
    });

    if (!this._user) {
      this._layoutActions.toggleMobile(window.innerWidth < 1024);
    }
  }

  propertySelected(selected: MatAutocompleteSelectedEvent) {
    // this.reset();
    const index = this.properties.findIndex(option => option.propertyId === selected.option.value);
    this.selectedProperty = this.properties[index];

    this.propertyControl.reset();
    this.postForm.markAsDirty();
  }

  removeSelectedProperty(id: number) {
    this.selectedProperty = new Property();
    this.postForm.markAsDirty();
  }

  createPostReview() {
    if (!this.selectedProperty.propertyId) {
      this._snackbar.error("Please fill venue details");
      return;
    }
    this.postForm.markAsPristine();

    this.review.propertyId = this.selectedProperty.propertyId;
    this.review.organizationName = this.postForm.get("organizationName").value;
    this.review.programName = this.postForm.get("programName").value;
    this.review.programStartDate = this.postForm.get("programStartDate").value;
    this.review.associates = this.postForm.get("associates").value;
    this.review.fullName = this.postForm.get("fullName").value;
    this.review.numberOfAttendees = this.postForm.get("numberOfAttendees").value;
    this.review.detailedReview = this.postForm.get("detailedReview").value;

    this.review.bServiceQuality = this.postForm.get("bServiceQuality").value;
    this.review.serviceQuality = this.review.bServiceQuality ? 0 : this.postForm.get("serviceQuality").value;

    this.review.bVenueCondition = this.postForm.get("bVenueCondition").value;
    this.review.venueCondition = this.review.bVenueCondition ? 0 : this.postForm.get("venueCondition").value;

    this.review.bFbQuality = this.postForm.get("bFbQuality").value;
    this.review.fbQuality = this.review.bFbQuality ? 0 : this.postForm.get("fbQuality").value;

    this.review.bResponseTimeliness = this.postForm.get("bResponseTimeliness").value;
    this.review.responseTimeliness = this.review.bResponseTimeliness
      ? 0
      : this.postForm.get("responseTimeliness").value;

    this.review.bHbFriendliness = this.postForm.get("bHbFriendliness").value;
    this.review.hbFriendliness = this.review.bHbFriendliness ? 0 : this.postForm.get("hbFriendliness").value;

    this.review.bOverallExperience = this.postForm.get("bOverallExperience").value;
    this.review.overallExperience = this.review.bOverallExperience ? 0 : this.postForm.get("overallExperience").value;

    this.review.bDestinationKnowledge = this.postForm.get("bDestinationKnowledge").value;
    this.review.destinationKnowledge = this.review.bDestinationKnowledge
      ? 0
      : this.postForm.get("destinationKnowledge").value;

    this.review.isRecommended = this.postForm.get("isRecommended").value
      ? this.postForm.get("isRecommended").value
      : false;
    this.review.hbAssociateFeedBack = this.postForm.get("hbAssociateFeedBack").value;
    this.review.testimonial = this.postForm.get("testimonial").value;
    this.review.showOnInsite = this.postForm.get("showOnInsite").value;

    if (!this.postForm.get("expirationDate").value) {
      let expiredDate = new Date();
      //Add default 24 months to current date.
      expiredDate.setMonth(expiredDate.getMonth() + 24);
      this.review.expirationDate = expiredDate;
    } else {
      this.review.expirationDate = this.postForm.get("expirationDate").value;
    }

    this.review.isApproved = this.postForm.get("isApproved").value ? this.postForm.get("isApproved").value : false;

    if (this.review.reviewId) {
      this._reviewService.updateReview(this.review).subscribe(res => {
        if (res instanceof HttpErrorResponse) {
          this.postForm.markAsDirty();
          this._snackbar.error("Unable to update review");
        } else {
          this._snackbar.success("Review updated successfully");
          this._location.back();
        }
      });
    } else {
      this.review.postType = "C";
      this.review.reviewSummary = "";
      this.review.activeStatus = 1;
      this.review.associateId = 0;
      this.review.reviewType = 1;

      this._reviewService.createReview(this.review).subscribe(res => {
        if (res instanceof HttpErrorResponse) {
          this.postForm.markAsDirty();
          this._snackbar.error("Unable to submit review");
        } else {
          this.reset();
          this._snackbar.success("Review submitted successfully");
          this._isSaved = true;
        }
      });
    }
  }

  reset() {
    if (this.review.reviewId) {
      this._location.back();
    } else {
      this.selectedProperty = new Property();
      this.postForm.get("detailedReview").setValue(0);
      this.postForm.get("serviceQuality").setValue(0);
      this.postForm.get("venueCondition").setValue(0);
      this.postForm.get("fbQuality").setValue(0);
      this.postForm.get("responseTimeliness").setValue(0);
      this.postForm.get("hbFriendliness").setValue(0);
      this.postForm.get("overallExperience").setValue(0);

      this.postForm.reset();
      this.postForm.markAsPristine();
    }
  }

  resetRating(field) {
    this.postForm.get(field).setValue(0);
  }

  sendMail() {
    this.settings$.pipe(distinctUntilChanged()).subscribe(settings => {
      if (settings) {
        const address = settings.find(setting => setting.name === "MissingHotelEmail:Address").value;
        const subject = settings.find(setting => setting.name === "MissingHotelEmail:Subject").value;
        location.href = `mailto:${address}?subject=${subject}`;
      } else {
        location.href = "mailto:admin@hbinsite.com?subject=Missing hotel information";
      }
    });
  }

  archiveReview() {
    let dialogRef = this._dialog.open(ModelDialogComponent, {
      width: "250px",
      data: {
        name: "Are you sure you want to archive this review?",
        okName: "Yes"
      }
    });

    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this._destructor$),
        filter(result => result),
        switchMap(() => {
          this.review.activeStatus = 0;
          return this._reviewService.updateReview(this.review);
        })
      )
      .subscribe(() => {
        this._snackbar.success("Review archived successfully");
        this._location.back();
      });
  }

  deleteReview() {
    let dialogRef = this._dialog.open(ModelDialogComponent, {
      width: "500px",
      data: {
        name: "Do you wish to delete this review from InSite?",
        okName: "Yes"
      }
    });

    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this._destructor$),
        filter(result => result),
        switchMap(() => {
          return this._reviewService.deleteReview(this.review.reviewId.toString());
        })
      )
      .subscribe(() => {
        this._snackbar.success("Review deleted successfully");
        this._location.back();
      });
  }
}
