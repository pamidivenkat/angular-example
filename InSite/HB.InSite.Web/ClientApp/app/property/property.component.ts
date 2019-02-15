import { select } from "@angular-redux/store";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { MatDialog } from "@angular/material";
import { ActivatedRoute } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { distinctUntilChanged, filter, map, switchMap, takeUntil } from "rxjs/operators";

import { Bookmark } from "../core/models/bookmark";
import { PostType } from "../core/models/post";
import { Property } from "../core/models/property";
import { Review } from "../core/models/review";
import { LayoutActions } from "../core/redux/actions/layout.actions";
import { ClaimsHelperService } from "../core/services/claims-helper.service";
import { PropertyService } from "../core/services/property.service";
import { SnackbarService } from "../core/services/snackbar.service";
import { BaseComponent } from "../shared/base-component";
import { ModelDialogComponent } from "../shared/components/model-dialog/model-dialog.component";
import { accordionAnimation } from "../shared/helpers/animations";
import { CommonHelpers } from "../shared/helpers/common-helper";
import { Content } from "./../core/models/property";
import { Rating } from "./../core/models/rating";

@Component({
  selector: "app-property",
  templateUrl: "./property.component.html",
  styleUrls: ["./property.component.scss"],
  encapsulation: ViewEncapsulation.None,
  animations: [accordionAnimation]
})
export class PropertyComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _dataReceived: boolean;
  private _averages: Rating;
  private _reviewsLength: number;
  private _maxId: number;
  private _totalCount: number;
  private _isCvb: boolean;
  private _contact: any;
  private _bookmarks: Array<Bookmark>;
  private _isMobile: boolean;
  private _loading: boolean = false;
  private _orientation: number = 0;
  // End of Private Fields

  // Public properties
  public property: Property;
  public posts: Array<Content>;
  public selectedType: Array<any>;
  public postTypes: Array<any>;
  public includeArchive: boolean;
  public propertySubject: Subject<Property> = new Subject();
  public showDetails: boolean;
  public showReviewDetails: Map<string, boolean> = new Map();
  public reviews: Array<any>;
  public ratingName: string;
  public isAdmin: boolean;
  public isImageUpdating: boolean = false;

  @select(["layout", "isScrollEnd"])
  isScrollEnd$: Observable<boolean>;

  @select(["layout", "isMobile"])
  isMobile$: Observable<boolean>;

  @select(["identity", "bookmarks"])
  private _bookmarks$: Observable<Array<Bookmark>>;

  get dataReceived(): boolean {
    return this._dataReceived;
  }
  get averages(): Rating {
    return this._averages;
  }
  get reviewsLength(): number {
    return this._reviewsLength;
  }
  get isCvb(): boolean {
    return this._isCvb;
  }
  get contact(): any {
    return this._contact;
  }
  get isMobile(): boolean {
    return this._isMobile;
  }
  get totalCount(): number {
    return this._totalCount;
  }
  get loading(): boolean {
    return this._loading;
  }
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _propertyService: PropertyService,
    private _layoutActions: LayoutActions,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog,
    private _claimsHelper: ClaimsHelperService
  ) {
    super();
    this._dataReceived = false;
    this._reviewsLength = 0;
    this._isCvb = false;
    this.posts = [];
    this.property = new Property();
    this.includeArchive = false;
  }
  // End of constructor

  // Private methods

  private _getAverage(reviews: Array<Review>, rating: string, ratingName: string): number {
    let totalRating = reviews.reduce((a, b) => {
      return a + +b[rating];
    }, 0);

    let numberOfReviews = reviews.filter(review => review[ratingName] !== true).length;

    return Math.floor(totalRating / numberOfReviews);
  }

  private _averageReviews(reviews: Array<any>) {
    this._averages = new Rating();
    this._averages.overall = this._getAverage(reviews, "overallExperience", "bOverallExperience");

    this._averages.fbQuality = this._getAverage(reviews, "fbQuality", "bFbQuality");

    this._averages.serviceQuality = this._getAverage(reviews, "serviceQuality", "bServiceQuality");

    this._averages.venueCondition = this._getAverage(reviews, "venueCondition", "bVenueCondition");

    this._averages.responseTimeliness = this._getAverage(reviews, "responseTimeliness", "bResponseTimeliness");

    this._averages.hbFriendliness = this._getAverage(reviews, "hbFriendliness", "bHbFriendliness");

    this._averages.destinationKnowledge = this._getAverage(reviews, "destinationKnowledge", "bDestinationKnowledge");
  }

  private _getContent(loadMore?: boolean) {
    let options: any = Object.create({});
    if (loadMore) {
      options["maxId"] = this._maxId;
    }
    if (this.includeArchive) {
      options["includeArchive"] = true;
    }
    let types = 0;
    if (this.selectedType.length > 0) {
      types = this.selectedType.reduce((a, b) => {
        return +a + +b;
      });
    }
    this._propertyService
      .getContentByPropertyId(this.property.propertyId, types, options)
      .pipe(takeUntil(this._destructor$))
      .subscribe(content => {
        this._loading = false;
        this._dataReceived = true;
        this.posts = this.posts.concat(content ? content.data : []);
        this._maxId = content ? content.paging.maxId : 0;
        this._totalCount = content ? content.paging.recordCount : 0;
      });
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this.postTypes = CommonHelpers.EnumToArray(PostType);

    this.selectedType = [];

    this._bookmarks$.pipe(distinctUntilChanged()).subscribe(bookmarks => {
      this._bookmarks = bookmarks ? bookmarks : [];
      const index = this._bookmarks.findIndex(bookmark => bookmark.entityId === this.property.propertyId);
      if (index === -1 && this.property.bookmarkId) {
        this.property.bookmarkId = 0;
      } else if (index !== -1) {
        this.property.bookmarkId = this._bookmarks[index].id;
      }
      this.propertySubject.next(Object.assign({}, this.property));
    });

    this.isAdmin = this._claimsHelper.isAdmin();

    this._activatedRoute.data
      .pipe(
        takeUntil(this._destructor$),
        map(response => {
          if (response.data instanceof HttpErrorResponse) {
            setTimeout(() => {
              this._snackbar.error("Unable get Venue/CVB details");
            }, 10);
          }
          return response;
        }),
        filter(property => !(property.data instanceof HttpErrorResponse)),
        map(property => {
          this.property = property.data;

          let location = [
            this.property.cityName,
            this.property.stateName,
            this.property.propertyZip,
            this.property.countryName
          ];
          this.property.location = location.filter(e => e).join(", ");

          this.propertySubject.next(Object.assign({}, this.property));
          this.property.type = PostType.Venue;
          this._isCvb = this.property.propertyChainId === 100325 && this.property.isInternalOnly === false;

          this._getContent();
          return this.property;
        }),
        switchMap(property => {
          const reviews = this._propertyService
            .getReviewsByPropertyId(property.propertyId)
            .pipe(takeUntil(this._destructor$));
          const contact = this._propertyService.getCVBContact(property.propertyId).pipe(takeUntil(this._destructor$));
          return Observable.combineLatest(reviews, contact);
        })
      )
      .subscribe(response => {
        if (response[0] instanceof HttpErrorResponse) {
          this._snackbar.error("Unable to read review information");
        } else {
          this._reviewsLength = response[0] ? response[0].length : 0;
          if (response[0]) {
            this._averageReviews(response[0]);
          } else {
            this._averages = new Rating();
          }
          this.reviews = response[0] ? response[0] : [];
        }
        if (this._isCvb) {
          if (response[1] instanceof HttpErrorResponse) {
            this._snackbar.error("Unable to read contact information");
          } else {
            this._contact = response[1];
          }
        }
      });

    this.isMobile$.pipe().subscribe(value => (this._isMobile = value));

    this.isScrollEnd$.pipe(takeUntil(this._destructor$)).subscribe(scrollEnd => {
      if (scrollEnd) {
        if (this.posts.length < this._totalCount) {
          this._getContent(true);
        }
      }
      this._layoutActions.updateScrollEnd(false);
      this._loading = false;
    });
  }

  loadMoreData() {
    this._getContent(true);
  }

  updateList(selected) {
    this._dataReceived = false;
    this.posts = [];
    this.selectedType = selected;
    this._getContent();
  }

  getMoreContent(scroll) {
    if (scroll.endReached) {
      this._loading = true;
      this._layoutActions.updateScrollEnd(true);
    }
  }

  mailToContact() {
    location.href = `mailto:${this._contact.overrideEmailAddress}`;
  }

  openWebsite() {
    if (!this._contact.webAddress.toLowerCase().startsWith("http")) {
      window.open(`http://${this._contact.webAddress}`, "_blank");
    } else {
      window.open(`${this._contact.webAddress}`, "_blank");
    }
  }

  reloadContent() {
    this._dataReceived = false;
    this.posts = [];
    this._getContent();
  }

  toggleDetails(ratingName) {
    this.showReviewDetails.set(ratingName, !this.showReviewDetails.get(ratingName));
  }

  show(ratingName) {
    return this.showReviewDetails.get(ratingName) && this._reviewsLength > 0;
  }

  onFileChange(event) {
    this.isImageUpdating = true;
    const formData: FormData = new FormData();
    let file = event.target.files[0];
    CommonHelpers._getOrientation(file, orientation => {
      this._orientation = orientation > 0 ? orientation : 0;

      formData.append("rotation", this._orientation.toString());
      formData.append("file", event.target.files[0], event.target.files[0].name);

      this._propertyService
        .uploadImage(this.property.propertyId, formData)
        .pipe(takeUntil(this._destructor$))
        .subscribe(response => {
          this.isImageUpdating = false;
          if (response instanceof HttpErrorResponse) {
            this._snackbar.error("Unable to upload image");
          } else {
            this.property.imageUrl = response;
          }
        });
    });
  }

  removeImage() {
    let dialogRef = this._dialog.open(ModelDialogComponent, {
      width: "500px",
      data: {
        name: "Are you sure you want to delete the image?",
        okName: "Yes"
      }
    });
    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this._destructor$),
        filter(result => result),
        switchMap(result => {
          const formData: FormData = new FormData();
          // formData.append("file", event.target.files[0]);
          return this._propertyService.removeImage(this.property.propertyId);
        })
      )
      .subscribe(response => {
        if (response instanceof HttpErrorResponse) {
          this._snackbar.error("Unable to delete image");
        } else {
          this.property.imageUrl = null;
        }
      });
  }

  getCount(rating: string, value: number): number {
    return this.reviews.filter(review => review[rating] == value).length;
  }
  // End of public methods
}
