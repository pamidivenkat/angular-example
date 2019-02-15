import { select } from "@angular-redux/store";
import { Location } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, forwardRef, OnInit, QueryList, ViewChildren, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatAutocompleteSelectedEvent, MatDialog } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil } from "rxjs/operators";

import * as constants from "../../app.constants";
import { PostType } from "../../core/models/post";
import { Property } from "../../core/models/property";
import { AssociateReview, ReviewType } from "../../core/models/review";
import { SnackbarType } from "../../core/models/snackbar-type";
import { User } from "../../core/models/user";
import { IdentityActions } from "../../core/redux/actions/identity.actions";
import { ClaimsHelperService } from "../../core/services/claims-helper.service";
import { PostService } from "../../core/services/post.service";
import { PropertyService } from "../../core/services/property.service";
import { ReviewService } from "../../core/services/review.service";
import { SnackbarService } from "../../core/services/snackbar.service";
import { BaseComponent } from "../../shared/base-component";
import { ModelDialogComponent } from "../../shared/components/model-dialog/model-dialog.component";
import { MatFileUpload } from "../../shared/mat-file-upload-module/matFileUploaders";
import { NativeScriptInterfaceService } from "../../shared/services/native-script-interface.service";

@Component({
  selector: "app-add-update-review",
  templateUrl: "./add-update-review.component.html",
  styleUrls: ["./add-update-review.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class AddUpdateReviewComponent extends BaseComponent implements OnInit {
  @select(["identity", "user"])
  User$: Observable<User>;

  property: Property;
  // Private Fields
  private _user: User;
  private _reviewId: number;
  private _review: AssociateReview; //Review;
  private _isCvb: boolean;
  private _reviewType: ReviewType;
  private _isEditable: boolean = false;
  private _attachments: any;
  private _pointsEarned: number;

  private defaultValues = {
    detailedReview: "",
    attachments: null,
    singleFile: null,
    imageFile: null,
    venue: "",
    venueCondition: 0,
    bVenueCondition: false,
    serviceQuality: 0,
    bServiceQuality: false,
    fbQuality: 0,
    bFbQuality: false,
    hbFriendliness: 0,
    bHbFriendliness: false,
    destinationKnowledge: 0,
    bDestinationKnowledge: false,
    responseTimeliness: 0,
    bResponseTimeliness: false,
    overallExperience: 0,
    bOverallExperience: false,
    type: 1,
    isCvb: false,
    isRecommended: false,
    expirationDate: "",
    expirationReminder: false
  };
  // End of Private Fields

  // Public properties
  public isHybridApp: boolean;
  public uploadURL: string;
  public reviewForm: FormGroup;
  public editorOptions: any;
  public properties: Array<any>;
  public propertyChains: Array<any>;
  public propertyControl: FormControl;
  public filteredProperties: Observable<any[]>;
  public selectedProperties: Array<any> = [];

  public propertyChainControl: FormControl;
  public filteredPropertyChains: Observable<any[]>;
  public selectedPropertyChains: Array<any> = [];

  public pageHeading: string;

  public propertyChainLoader: boolean = false;
  public propertyLoader: boolean = false;

  public maxFileLength: number;
  public maxNoFiles: number;
  public readonlyVenue: boolean = false;
  public minExpirationDate: Date;
  public expirationMonths: number;
  public isMobile: boolean = false;
  public maxNoImages: number = 12;
  public isUploadInProgress: boolean = false;

  get postType(): PostType {
    return PostType.Review;
  }
  get reviewType(): ReviewType {
    return this._reviewType;
  }
  get review() {
    return this._review;
  }
  get isCvb(): boolean {
    return this._isCvb;
  }

  get attachments(): Array<any> {
    this._review.attachments = this._review.attachments ? this._review.attachments : [];
    this._attachments = this._attachments ? this._attachments : this._review.attachments;
    return this._attachments;
  }
  set attachments(value: Array<any>) {
    this._attachments = this._review.attachments = value ? value : [];
  }

  get attachedImages(): Array<any> {
    return this._attachments.filter(attachment => attachment.isImage);
  }

  get attachedFiles(): Array<any> {
    return this._attachments.filter(attachment => !attachment.isImage);
  }

  get reviewId(): number {
    return parseInt(this._reviewId + "");
  }
  get isEditable(): boolean {
    return this._isEditable;
  }

  @select(["settings", "values"])
  settings$: Observable<Array<any>>;

  @select(["layout", "isMobile"])
  isMobile$: Observable<boolean>;

  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  @ViewChildren(forwardRef(() => MatFileUpload))
  _fileUploads: QueryList<MatFileUpload>;
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(
    private _fb: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _reviewService: ReviewService,
    private _snackbarService: SnackbarService,
    private _propertyService: PropertyService,
    private _dialog: MatDialog,
    private nsInterfaceService: NativeScriptInterfaceService,
    private _claimsHelper: ClaimsHelperService,
    private _location: Location,
    private _identityActions: IdentityActions,
    private _postService: PostService
  ) {
    super();
    this.minExpirationDate = new Date();

    this.User$.pipe(
      distinctUntilChanged(),
      filter(u => u != null)
    ).subscribe(u => (this._user = u));

    this.properties = [];
    this.propertyChains = [];

    this.propertyControl = new FormControl();
    this.propertyChainControl = new FormControl();

    this.filteredProperties = this.propertyControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(value => {
        const trimmedValue: string = value ? value.trim() : "";
        if (trimmedValue.length >= 3) {
          this.propertyLoader = true;
          return this._getPropertiesByName(value);
        } else {
          return of([]);
        }
      })
    );

    this.filteredPropertyChains = this.propertyChainControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(value => {
        const trimmedValue: string = value ? value.trim() : "";
        if (trimmedValue.length >= 3) {
          this.propertyChainLoader = true;
          return this._getPropertyChainsByName(value);
        } else {
          return of([]);
        }
      })
    );

    this.isMobile$.pipe(distinctUntilChanged()).subscribe(value => {
      this.isMobile = value ? true : false;
    });
  }
  // End of constructor
  // Private methods
  private _initForm() {
    this.isHybridApp = window["isHybridApp"];
    this.reviewForm = this._fb.group(this.defaultValues);
  }

  public uploadEvent($event: any) {
    console.log("from client" + JSON.stringify($event));
  }

  private _getVenueIds(): number {
    if (this._review.propertyId) {
      return this._review.propertyId;
    }
  }

  private _getPropertiesByName(searchText: string) {
    return this._propertyService.searchProperties(searchText).pipe(
      map(response => {
        const selectedPropertyIds = this.selectedProperties.map(({ propertyId }) => propertyId);
        this.properties = [];
        response.value.map(property => {
          if (selectedPropertyIds.indexOf(property.propertyID) === -1) {
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

  private _getPropertyChainsByName(searchText: string) {
    return this._propertyService.getPropertyChainsByName(searchText).pipe(
      map(response => {
        const selectedPropertyChainIds = this.selectedPropertyChains.map(({ propertyChainID }) => propertyChainID);
        this.propertyChains = response.filter(
          propertyChain => selectedPropertyChainIds.indexOf(propertyChain.propertyChainID) === -1
        );
        this.propertyChainLoader = false;
        return this.propertyChains;
      })
    );
  }

  private _isCVBProperty(property: Property): boolean {
    return (
      property.propertyChainId === 100325 && property.isInternalOnly === false
      //  &&
      //property.propertyAdvanceEligible === true
    );
  }

  private _addToSelectedProperty(property) {
    this.selectedProperties = [property];
    this.selectedProperties.sort((a, b) => {
      return a.propertyName > b.propertyName ? 1 : -1;
    });
    const brand = {
      propertyChainID: property.propertyChainId,
      propertyChainName: property.propertyChainName
    };
    this.selectedPropertyChains.push(brand);
    this.propertyControl.reset();
    this.reviewForm.markAsDirty();
  }

  public chooseFile(event) {
    this.nsInterfaceService.nsEventEmitter({ type: "fileUpload" });
  }

  private _removeUnusedAttachments() {
    this._review.attachments = this._review.attachments.filter(attachment => attachment.fileIdentifier !== "");
  }

  private _updateReviewValues() {
    this._review.reviewId = this._reviewId ? this._reviewId : 0;
    this._review.reviewType = this.isCvb ? 1 : 0;
    this._review.detailedReview = this.reviewForm.get("detailedReview").value;
    this._review.isRecommended = this.reviewForm.get("isRecommended").value;
    this._review.activeStatus = 1;

    if (this.isCvb) {
      this._review.bResponseTimeliness = this.reviewForm.get("bResponseTimeliness").value;
      this._review.responseTimeliness = this._review.bResponseTimeliness
        ? 0
        : this.reviewForm.get("responseTimeliness").value;

      this._review.bHbFriendliness = this.reviewForm.get("bHbFriendliness").value;
      this._review.hbFriendliness = this._review.bHbFriendliness ? 0 : this.reviewForm.get("hbFriendliness").value;

      this._review.bDestinationKnowledge = this.reviewForm.get("bDestinationKnowledge").value;
      this._review.destinationKnowledge = this._review.bDestinationKnowledge
        ? 0
        : this.reviewForm.get("destinationKnowledge").value;

      this._review.bVenueCondition = this._review.bFbQuality = false;
      this._review.venueCondition = this._review.bVenueCondition ? 0 : (this._review.fbQuality = 0);
    } else {
      this._review.bVenueCondition = this.reviewForm.get("bVenueCondition").value;
      this._review.venueCondition = this._review.bVenueCondition ? 0 : this.reviewForm.get("venueCondition").value;

      this._review.bFbQuality = this.reviewForm.get("bFbQuality").value;
      this._review.fbQuality = this._review.bFbQuality ? 0 : this.reviewForm.get("fbQuality").value;

      this._review.destinationKnowledge = this._review.hbFriendliness = this._review.responseTimeliness = 0;
      this._review.bDestinationKnowledge = this._review.bHbFriendliness = this._review.bResponseTimeliness = false;
    }

    this._review.bServiceQuality = this.reviewForm.get("bServiceQuality").value;
    this._review.serviceQuality = this._review.bServiceQuality ? 0 : this.reviewForm.get("serviceQuality").value;

    this._review.bOverallExperience = this.reviewForm.get("bOverallExperience").value;
    this._review.overallExperience = this._review.bOverallExperience
      ? 0
      : this.reviewForm.get("overallExperience").value;

    this._review.propertyId = this.selectedProperties.map(({ propertyId }) => propertyId)[0];
    this._review.reviewSummary = this.isCvb ? "CVB review" : "Venue review";
    this._review.postType = "A";

    if (!this.reviewForm.get("expirationDate").value) {
      let expiredDate = new Date();
      //Add default 24 months to current date.
      expiredDate.setMonth(expiredDate.getMonth() + 24);
      this._review.expirationDate = expiredDate;
    } else {
      this._review.expirationDate = this.reviewForm.get("expirationDate").value;
    }

    this._review.expirationReminder = this.reviewForm.get("expirationReminder").value;
    this._review.attachments = this.attachments;
    this._removeUnusedAttachments();
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this.settings$.pipe(takeUntil(this._destructor$)).subscribe(settings => {
      if (settings) {
        this.maxFileLength = settings.find(setting => setting.name === "UploadFileMaxSize").value;

        this.maxNoFiles = settings.find(setting => setting.name === "UploadFileSelectionLimit").value;
        this.maxNoImages = settings.find(setting => setting.name.toLowerCase() === "uploadimageselectionlimit").value;

        this.expirationMonths = settings.find(setting => setting.name === "Expiration:Review").value;
        //console.log('setting loaded');
      } else {
        //console.log('no settings')
      }
    });

    this.uploadURL = constants.apiUrl + "FileUpload";
    this._activatedRoute.url.subscribe(urlComponents => {
      let key = urlComponents[0].path.replace(/(?:^|\s)[a-z]/g, m => m.toUpperCase());
      this._reviewType = ReviewType[key];
    });

    const routeSubscription$ = this._activatedRoute.params.pipe(takeUntil(this._destructor$));
    const dataSubscriptions$ = this._activatedRoute.data.pipe(takeUntil(this._destructor$));

    Observable.combineLatest(routeSubscription$, dataSubscriptions$)
      .pipe(takeUntil(this._destructor$))
      .subscribe(values => {
        const params = values[0];
        const data = values[1].data ? values[1].data : values[1].reviewData;
        this._reviewId = parseInt(params["id"] + "");

        this._review = new AssociateReview();
        this.pageHeading = "Add";
        this._initForm();

        if (this._reviewId) {
          this.readonlyVenue = true;
          this.pageHeading = "Edit";
          this._review = data;
          if (this._claimsHelper.canEditEntity(this._review.createdBy)) {
            this._isEditable = true;
          } else {
            this._isEditable = false;
          }
          this._reviewType = this._review.reviewType;
          this.selectedProperties = [];
          this.property = this._review.property;
          this.selectedProperties.push(this._review.property);
          this._isCvb = this._isCVBProperty(this._review.property);

          this.attachments = this._review.attachments;
          this.reviewForm.get("detailedReview").setValue(this._review.detailedReview);
          this.reviewForm.get("isRecommended").setValue(this._review.isRecommended);
          if (this.isCvb) {
            this.reviewForm.get("responseTimeliness").setValue(+this._review.responseTimeliness);
            this.reviewForm.get("bResponseTimeliness").setValue(this._review.bResponseTimeliness);
            this.reviewForm.get("hbFriendliness").setValue(+this._review.hbFriendliness);
            this.reviewForm.get("bHbFriendliness").setValue(this._review.bHbFriendliness);
            this.reviewForm.get("destinationKnowledge").setValue(+this._review.destinationKnowledge);
            this.reviewForm.get("bDestinationKnowledge").setValue(this._review.bDestinationKnowledge);
          } else {
            this.reviewForm.get("bVenueCondition").setValue(this._review.bVenueCondition);
            this.reviewForm.get("venueCondition").setValue(+this._review.venueCondition);
            this.reviewForm.get("bFbQuality").setValue(this._review.bFbQuality);
            this.reviewForm.get("fbQuality").setValue(+this._review.fbQuality);
          }
          this.reviewForm.get("bServiceQuality").setValue(this._review.bServiceQuality);
          this.reviewForm.get("serviceQuality").setValue(+this._review.serviceQuality);
          this.reviewForm.get("bOverallExperience").setValue(this._review.bOverallExperience);
          this.reviewForm.get("overallExperience").setValue(+this._review.overallExperience);

          this.reviewForm.get("expirationReminder").setValue(this._review.expirationReminder);
          this.reviewForm.markAsDirty();
        } else {
          //this._review.bDestinationKnowledge = this._review.bFbQuality = this._review.bHbFriendliness = this._review.bOverallExperience = this._review.bResponseTimeliness = this._review.bServiceQuality = this._review.bVenueCondition = true;
          this._isEditable = true;

          this.attachments = [];
          if (data) {
            this._isCvb = this._isCVBProperty(data);

            this.readonlyVenue = true;
            this._addToSelectedProperty(data);
          }
        }

        let expiredDate = new Date();
        setTimeout(() => {
          expiredDate.setMonth(expiredDate.getMonth() + +this.expirationMonths);
          this.reviewForm.get("expirationDate").setValue(expiredDate);
        }, 50);
      });

    this.nsInterfaceService.nsEventLister(
      { type: "selectedFile", object: this },
      function(that, file) {
        console.log("NS sent - selectedFile : " + JSON.stringify(file));
        that.attachments.push(file);
        that.addAttachment({ file: file }, that.attachments.length - 1);
        that._cdr.detectChanges();
        that.reviewForm.markAsDirty();
      },
      function(error) {
        console.log("NS sent - selectedFile : Error:" + JSON.stringify(error));
      }
    );
  }

  ratingChanged(event) {
    if (event.target) {
      this.reviewForm.markAsDirty();
    }
  }

  onSubmit() {
    let pendingAttachments = this._fileUploads.filter(fileUpload => !fileUpload.isPreview);

    if (pendingAttachments.length > 0) {
      this._snackbarService.error("Please upload pending attachments");
      return;
    }

    if (!this.reviewForm.valid) {
      this._snackbarService.error("Please fix the errors");
      return;
    }

    this.reviewForm.markAsPristine();
    this.settings$.pipe(distinctUntilChanged()).subscribe(settings => {
      if (settings) {
        this._pointsEarned = settings.find(setting => setting.name.toLowerCase() === "points:review").value;
      }
    });

    this._updateReviewValues();

    if (!this._reviewId) {
      this._reviewService
        .createAssociateReview(this._review)
        .pipe(takeUntil(this._destructor$))
        .subscribe(response => {
          if (!response.error) {
            this._snackbarService.success(
              `Review added successfully - ${this._pointsEarned} points earned`,
              SnackbarType.Success
            );

            let updatedUser: User = Object.assign({}, this._user);
            updatedUser.points = +updatedUser.points + +this._pointsEarned;
            this._identityActions.loadUserIdentity(updatedUser);

            this._location.back();
          } else {
            this._snackbarService.error("Unable to submit the review");
            this.reviewForm.markAsDirty();
          }
        });
    } else {
      this._reviewService
        .updateReview(this._review)
        .pipe(
          takeUntil(this._destructor$),
          switchMap(response => {
            if (!response.error) {
              this._snackbarService.success("Review updated successfully", SnackbarType.Success);
              return of(true);
            } else {
              this._snackbarService.error("Unable to submit the review");
              this.reviewForm.markAsDirty();
              return of(false);
            }
          }),
          filter(result => result),
          switchMap(() => {
            return this._postService.getExpiringCount(this._user.id);
          })
        )
        .subscribe(count => {
          this._identityActions.userExpCount(count instanceof HttpErrorResponse ? 0 : count);
          this._location.back();
        });
    }
  }

  cancel() {
    this.reviewForm.reset(this.defaultValues);

    this._location.back();
  }

  sendMail() {
    this.settings$.pipe(distinctUntilChanged()).subscribe(settings => {
      if (settings) {
        const address = settings.find(setting => setting.name === "MissingHotelEmail:Address").value;
        const subject = settings.find(setting => setting.name === "MissingHotelEmail:Subject").value;
        location.href = `mailto:${address}?subject=${subject}`;

        this._pointsEarned = settings.find(setting => setting.name.toLowerCase() === "points:review").value;
      } else {
        location.href = "mailto:admin@hbinsite.com?subject=Missing hotel information";
      }
    });
  }

  propertySelected(selected: MatAutocompleteSelectedEvent) {
    const index = this.properties.findIndex(option => option.propertyId === selected.option.value);
    if (this.selectedProperties.length > 0) {
      this.selectedProperties.splice(0, 1);
    }
    this._addToSelectedProperty(this.properties[index]);
    this.property = this.properties[index];
    this.reviewForm.markAsDirty();
    this._isCvb = this._isCVBProperty(this.property);
  }
  selectedPropertyById(id: number) {
    const index = this.properties.findIndex(option => option.propertyId === id);
    return this.properties[index];
  }
  removeSelectedProperty(id: number) {
    const index = this.selectedProperties.findIndex(chip => chip.propertyId === id);
    this.selectedProperties.splice(index, 1);
    this.reviewForm.markAsDirty();
  }

  archiveReview() {
    let dialogRef = this._dialog.open(ModelDialogComponent, {
      width: "250px",
      data: {
        name: "Are you sure you want to archive this record?",
        okName: "Yes"
      }
    });

    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this._destructor$),
        filter(result => result),
        switchMap(result => {
          return this._reviewService.archiveReview(this._review.reviewId);
        })
      )
      .subscribe(response => {
        if (response instanceof HttpErrorResponse) {
          this._snackbarService.error("Unable to archive the review");
        } else {
          this._snackbarService.success("Review archived successfully", SnackbarType.Success);
          this._router.navigateByUrl("/");
        }
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
        switchMap(result => {
          //this._review.active = false;
          this._updateReviewValues();
          return this._reviewService.deleteReview(this._review.reviewId.toString());
        })
      )
      .subscribe(response => {
        this._snackbarService.success("Review deleted successfully", SnackbarType.Success);
        this._router.navigateByUrl("/");
      });
  }

  addAttachment(event, isImage: boolean) {
    event.file.isImage = isImage;

    if (event.file.fileIdentifier && this.reviewId) {
      event.file.reviewId = this.reviewId;
      event.file.id = event.file.id ? event.file.id : 0;
      event.file.active = true;
      event.file.createdOn = event.file.createdOn ? event.file.createdOn : new Date();
      event.file.createdBy = event.file.createdBy ? event.file.createdBy : "";
      event.file.modifiedOn = event.file.modifiedOn ? event.file.modifiedOn : new Date();
      event.file.modifiedBy = event.file.modifiedBy ? event.file.modifiedBy : "";
    }
    this.attachments.push(event.file);
    this.isUploadInProgress = false;
    this.reviewForm.markAsDirty();
  }

  removeAttachment(event) {
    this.attachments = this.attachments.filter(attachment => attachment.fileIdentifier != event.file.fileIdentifier);
    this.reviewForm.markAsDirty();
    if (event && event.isPreview) {
      this._snackbarService.success("Please submit the form to save the changes");
    }
  }

  updateProgress(event) {
    this.isUploadInProgress = true;
  }
  // End of public methods
}
