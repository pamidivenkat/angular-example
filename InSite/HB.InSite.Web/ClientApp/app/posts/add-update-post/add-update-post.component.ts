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
import { Category } from "../../core/models/category";
import { Post, PostType } from "../../core/models/post";
import { SnackbarType } from "../../core/models/snackbar-type";
import { User } from "../../core/models/user";
import { IdentityActions } from "../../core/redux/actions/identity.actions";
import { CategoryService } from "../../core/services/category.service";
import { ClaimsHelperService } from "../../core/services/claims-helper.service";
import { PostService } from "../../core/services/post.service";
import { PropertyService } from "../../core/services/property.service";
import { SnackbarService } from "../../core/services/snackbar.service";
import { BaseComponent } from "../../shared/base-component";
import { ModelDialogComponent } from "../../shared/components/model-dialog/model-dialog.component";
import { MatFileUpload } from "../../shared/mat-file-upload-module/matFileUploaders";
import { NativeScriptInterfaceService } from "../../shared/services/native-script-interface.service";

@Component({
  selector: "app-add-update-post",
  templateUrl: "./add-update-post.component.html",
  styleUrls: ["./add-update-post.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class AddUpdatePostComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _postId: number;
  private _post: Post;
  private _postType: PostType;
  private _isEditable: boolean = false;
  private _attachments: any;
  private _insightPoints: number;
  private _questionPoints: number;
  private _user: any;
  // End of Private Fields

  // Public properties
  public isHybridApp: boolean;
  public uploadURL: string;
  public postForm: FormGroup;
  public categories: Array<any>;
  public editorOptions: any;
  public properties: Array<any>;
  public propertyChains: Array<any>;
  public locations: Array<any>;
  public propertyControl: FormControl;
  public filteredProperties: Observable<any[]>;
  public selectedProperties: Array<any> = [];

  public propertyChainControl: FormControl;
  public filteredPropertyChains: Observable<any[]>;
  public selectedPropertyChains: Array<any> = [];

  public locationControl: FormControl;
  public filteredLocations: Observable<any[]>;
  public selectedLocations: Array<any> = [];
  public minExpirationDate: Date;
  public pageHeading: string;

  public propertyChainLoader: boolean = false;
  public locationLoader: boolean = false;
  public propertyLoader: boolean = false;

  public maxFileLength: number;
  public maxNoFiles: number;

  //TODO: Move static values to constants or settings.
  public maxNoImages: number = 12;

  public isUploadInProgress: boolean = false;
  public isReadonlyVenue: boolean = false;

  get postType(): PostType {
    return this._postType;
  }

  get attachments(): Array<any> {
    this._post.attachments = this._post.attachments ? this._post.attachments : [];
    this._attachments = this._attachments ? this._attachments : this._post.attachments;
    return this._attachments;
  }
  set attachments(value: Array<any>) {
    this._attachments = this._post.attachments = value ? value : [];
  }

  get attachedImages(): Array<any> {
    return this._attachments.filter(attachment => attachment.isImage);
  }

  get attachedFiles(): Array<any> {
    return this._attachments.filter(attachment => !attachment.isImage);
  }

  get postId(): number {
    return parseInt(this._postId + "");
  }
  get isEditable(): boolean {
    return this._isEditable;
  }

  @select(["settings", "values"])
  settings$: Observable<Array<any>>;

  @select(["identity", "user"])
  private _user$: Observable<any>;
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
    private _postService: PostService,
    private _categoryService: CategoryService,
    private _snackbarService: SnackbarService,
    private _propertyService: PropertyService,
    private _dialog: MatDialog,
    private nsInterfaceService: NativeScriptInterfaceService,
    private _claimsHelper: ClaimsHelperService,
    private _identityActions: IdentityActions,
    private _location: Location
  ) {
    super();
    this.minExpirationDate = new Date();

    this.properties = [];
    this.propertyChains = [];
    this.locations = [];
    this.categories = [];

    this.propertyControl = new FormControl();
    this.propertyChainControl = new FormControl();
    this.locationControl = new FormControl();

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

    this.filteredLocations = this.locationControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(value => {
        const trimmedValue: string = value ? value.trim() : "";
        if (trimmedValue.length >= 3) {
          this.locationLoader = true;
          return this._getLocationsByName(value);
        } else {
          return Observable.of([]);
        }
      })
    );
  }
  // End of constructor

  // Private methods
  private _initForm() {
    this.isHybridApp = window["isHybridApp"];

    this.postForm = this._fb.group({
      category: "",
      title: "",
      details: "",
      attachments: null,
      singleFile: null,
      imageFile: null,
      venue: "",
      location: "",
      brand: "",
      expirationDate: "",
      type: 1,
      expirationReminder: false
    });

    this.nsInterfaceService.nsEventLister(
      { type: "selectedFile", object: this },
      function(that, file) {
        console.log("NS sent - selectedFile : " + JSON.stringify(file));
        that.attachments.push(file);
        that.addAttachment({ file: file }, that.attachments.length - 1);
        that._cdr.detectChanges();
        this.postForm.markAsDirty();
      },
      function(error) {
        console.log("NS sent - selectedFile : Error:" + JSON.stringify(error));
      }
    );
  }

  private _setVenues() {
    if (this._post.postProperties) {
      this._post.postProperties.map(postProperty => {
        const property = {
          propertyId: postProperty.property.propertyId,
          propertyName: postProperty.property.propertyName
        };
        this.selectedProperties.push(property);
      });
    }
  }
  public uploadEvent($event: any) {
    console.log("from client" + JSON.stringify($event));
  }

  private _getVenueIds(): number {
    if (this._post.postProperties && this._post.postProperties.length > 0) {
      return this._post.postProperties[0].propertyId;
    }
  }
  private _setBrands() {
    if (this._post.postPropertyChains) {
      this._post.postPropertyChains.map(postPropertyChain => {
        const propertyChain = {
          propertyChainID: postPropertyChain.propertyChain.propertyChainID,
          propertyChainName: postPropertyChain.propertyChain.propertyChainName
        };
        this.selectedPropertyChains.push(propertyChain);
      });
    }
  }
  private _setLocations() {
    if (this._post.postLocations) {
      this._post.postLocations.map(postLocation => {
        const location = {
          id: postLocation.location.id,
          name: postLocation.location.name
        };
        this.selectedLocations.push(location);
      });
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

  private _getLocationsByName(searchText: string) {
    return this._propertyService.getLocationsByName(searchText).pipe(
      map(response => {
        const selectedLocationIds = this.selectedLocations.map(({ id }) => id);
        this.locations = response.filter(location => selectedLocationIds.indexOf(location.id) === -1);
        this.locationLoader = false;
        return this.locations;
      })
    );
  }

  private _addToSelectedProperty(property) {
    this.selectedProperties.push(property);
    this.selectedProperties.sort((a, b) => {
      return a.propertyName > b.propertyName ? 1 : -1;
    });

    if (property.propertyChainId && property.propertyChainName) {
      let propertyIndex = this.selectedPropertyChains.findIndex(
        propertyChain => propertyChain.propertyChainID === property.propertyChainId
      );

      if (propertyIndex === -1) {
        this.selectedPropertyChains.push({
          propertyChainID: property.propertyChainId,
          propertyChainName: property.propertyChainName
        });
      }
    }

    if (property.locationId && property.location) {
      let locationIndex = this.selectedLocations.findIndex(location => location.id === property.locationId);

      if (locationIndex === -1) {
        this.selectedLocations.push({
          id: property.locationId,
          name: property.location
        });
      }
    }

    this.propertyControl.reset();
    this.postForm.markAsDirty();
  }

  public chooseFile(event) {
    this.nsInterfaceService.nsEventEmitter({ type: "fileUpload" });
  }

  private _removeUnusedAttachments() {
    this._post.attachments = this._post.attachments.filter(attachment => attachment.fileIdentifier !== "");
  }

  private _updatePostValues() {
    this._post.id = this._postId ? this._postId : 0;
    this._post.categoryId = this.postForm.get("category").value;
    this._post.title = this.postForm.get("title").value;
    this._post.detail = this.postForm.get("details").value;
    this._post.expirationDate = this.postForm.get("expirationDate").value;
    this._post.expirationReminder = this.postForm.get("expirationReminder").value;
    this._post.type = this._post.type;
    this._post.comments = this._post.comments ? this._post.comments : [];
    this._post.postLocations = this.selectedLocations.map(({ id }) => id);
    this._post.postProperties = this.selectedProperties.map(({ propertyId }) => propertyId);
    this._post.postPropertyChains = this.selectedPropertyChains.map(({ propertyChainID }) => propertyChainID);

    this._removeUnusedAttachments();
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this._categoryService
      .getAllCategories()
      .pipe(takeUntil(this._destructor$))
      .subscribe(categories => {
        this.categories = categories.sort(function(a, b) {
          return a.propertyName > b.propertyName ? 1 : 0;
        });
      });

    this.settings$.pipe(takeUntil(this._destructor$)).subscribe(settings => {
      if (settings) {
        this.maxFileLength = settings.find(setting => setting.name.toLowerCase() === "uploadfilemaxsize").value;

        this.maxNoFiles = settings.find(setting => setting.name.toLowerCase() === "uploadfileselectionlimit").value;
        this.maxNoImages = settings.find(setting => setting.name.toLowerCase() === "uploadimageselectionlimit").value;

        this._insightPoints = settings.find(setting => setting.name.toLowerCase() === "points:insight").value;

        this._questionPoints = settings.find(setting => setting.name.toLowerCase() === "points:question").value;
      }
    });

    this.uploadURL = constants.apiUrl + "FileUpload";
    this._activatedRoute.url.subscribe(urlComponents => {
      let key = urlComponents[0].path.replace(/(?:^|\s)[a-z]/g, m => m.toUpperCase());
      this._postType = PostType[key];
    });

    const routeSubscription$ = this._activatedRoute.params.pipe(takeUntil(this._destructor$));
    const dataSubscriptions$ = this._activatedRoute.data.pipe(takeUntil(this._destructor$));

    Observable.combineLatest(routeSubscription$, dataSubscriptions$)
      .pipe(takeUntil(this._destructor$))
      .subscribe(values => {
        const params = values[0];
        const data = values[1].data ? values[1].data : values[1].postData;
        this._postId = parseInt(params["id"] + "");
        this._post = new Post();
        this.pageHeading = this._postType === PostType.Question ? "Ask" : "Add";
        this._initForm();
        if (this._postId) {
          this.pageHeading = "Edit";
          this._post = data;
          this._postType = this._post.type;
          this.attachments = this._post.attachments;
          this.postForm.get("title").setValue(this._post.title);
          this.postForm.get("details").setValue(this._post.detail);
          this.postForm.get("expirationDate").setValue(this._post.expirationDate);
          this.postForm.get("type").setValue(this._postType);
          this.postForm.get("category").setValue(this._post.categoryId);

          setTimeout(() => {
            this.updateExpireDate(this._post.categoryId);
            this.postForm.markAsDirty();
          }, 1000);

          this._setVenues();
          this._setLocations();
          this._setBrands();
          this._isEditable = this._claimsHelper.canEditEntity(this._post.createdBy);
        } else {
          this._isEditable = true;
          this.attachments = [];

          //If redirected from venue page, set the venue and other details.
          if (data) {
            this.isReadonlyVenue = true;
            this._addToSelectedProperty(data);
          }
        }
      });

    this._user$.pipe(takeUntil(this._destructor$)).subscribe(u => (this._user = u));
  }

  onSubmit() {
    let pendingAttachments = this._fileUploads.filter(fileUpload => !fileUpload.isPreview);

    if (pendingAttachments.length > 0) {
      this._snackbarService.error("Please upload pending attachments");
      return;
    }

    if (!this.postForm.valid) {
      this._snackbarService.error("Please fix the errors");
      return;
    }
    this.postForm.markAsPristine();
    this._post.active = true;
    this._post.archive = false;

    this._updatePostValues();

    if (!this._postId) {
      this._post.type = this._postType;
      // console.log(this._post);
      this._postService
        .createPost(this._post)
        .pipe(takeUntil(this._destructor$))
        .subscribe(response => {
          if (response instanceof HttpErrorResponse) {
            this.postForm.markAsDirty();
            this._snackbarService.error(
              "Unable to create " + (this._post.type === PostType.Insight ? "Insight" : "Question")
            );
          } else {
            this._snackbarService.success(
              `${this._post.type === PostType.Insight ? "Insight" : "Question"} added successfully - ${
                this._post.type === PostType.Insight ? this._insightPoints : this._questionPoints
              } points earned`,
              SnackbarType.Success
            );

            let updatedUser: User = Object.assign({}, this._user);
            updatedUser.points =
              +updatedUser.points +
              +(this._post.type === PostType.Insight ? this._insightPoints : this._questionPoints);
            this._identityActions.loadUserIdentity(updatedUser);
            this._location.back();
          }
        });
    } else {
      this._postService
        .updatePost(this._post)
        .pipe(
          takeUntil(this._destructor$),
          switchMap(response => {
            if (response instanceof HttpErrorResponse) {
              this.postForm.markAsDirty();
              const msg = "Unable to update " + (this._post.type === PostType.Insight ? "Insight" : "Question");
              this._snackbarService.error(msg);
              return of(false);
            } else {
              this._snackbarService.success("Post updated successfully", SnackbarType.Success);
              return of(true);
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
    this.postForm.reset({
      category: "",
      title: "",
      details: "",
      attachments: null,
      singleFile: null,
      imageFile: null,
      venue: "",
      location: "",
      brand: "",
      expirationDate: "",
      expirationReminder: false
    });

    this._location.back();
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

  propertySelected(selected: MatAutocompleteSelectedEvent) {
    const index = this.properties.findIndex(option => option.propertyId === selected.option.value);
    this._addToSelectedProperty(this.properties[index]);
  }

  removeSelectedProperty(id: number) {
    const index = this.selectedProperties.findIndex(chip => chip.propertyId === id);
    this.selectedProperties.splice(index, 1);
    this.postForm.markAsDirty();
  }

  propertyChainSelected(selected: MatAutocompleteSelectedEvent) {
    const index = this.propertyChains.findIndex(option => option.propertyChainID === selected.option.value);
    this.selectedPropertyChains.push(this.propertyChains[index]);
    this.selectedPropertyChains.sort((a, b) => (a.propertyChainName > b.propertyChainName ? 1 : -1));
    this.propertyChainControl.reset();
    this.postForm.markAsDirty();
  }

  removeSelectedPropertyChain(id: number) {
    const index = this.selectedPropertyChains.findIndex(chip => chip.propertyChainID === id);
    this.selectedPropertyChains.splice(index, 1);
    this.postForm.markAsDirty();
  }

  locationSelected(selected: MatAutocompleteSelectedEvent) {
    const selectedIndex = this.locations.findIndex(location => location.id === selected.option.value);
    this.selectedLocations.push(this.locations[selectedIndex]);
    this.selectedLocations.sort((a, b) => (a.name > b.name ? 1 : -1));
    this.locationControl.reset();
    this.postForm.markAsDirty();
  }

  removeSelectedLocation(id: number) {
    const index = this.selectedLocations.findIndex(chip => chip.id === id);
    this.selectedLocations.splice(index, 1);
    this.postForm.markAsDirty();
  }

  archivePost() {
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
          this._post.archive = true;
          this._updatePostValues();
          return this._postService.updatePost(this._post);
        })
      )
      .subscribe(response => {
        this._snackbarService.success("Post archived successfully", SnackbarType.Success);
        this._router.navigateByUrl("/");
      });
  }

  deletePost() {
    let dialogRef = this._dialog.open(ModelDialogComponent, {
      width: "500px",
      data: {
        name: "Are you sure you want to delete this record?",
        okName: "Yes"
      }
    });

    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this._destructor$),
        filter(result => result),
        switchMap(result => {
          this._post.active = false;
          this._updatePostValues();
          return this._postService.deletePost(this._post.id.toString());
        })
      )
      .subscribe(response => {
        this._snackbarService.success("Post deleted successfully", SnackbarType.Success);
        this._identityActions.userBookmarksInit(this._post.createdBy);
        this._router.navigateByUrl("/");
      });
  }

  updateExpireDate(id: number) {
    const category: Category = this.categories.find(category => category.id === id);
    let expiredDate = new Date();
    expiredDate.setMonth(expiredDate.getMonth() + category.expirationInMonths);
    this.postForm.get("expirationDate").setValue(expiredDate);
  }

  addAttachment(event, isImage: boolean) {
    event.file.isImage = isImage;

    if (event.file.fileIdentifier && this.postId) {
      event.file.postId = this.postId;
      event.file.id = event.file.id ? event.file.id : 0;
      event.file.active = true;
      event.file.createdOn = event.file.createdOn ? event.file.createdOn : new Date();
      event.file.createdBy = event.file.createdBy ? event.file.createdBy : this._post.createdBy;
      event.file.modifiedOn = event.file.modifiedOn ? event.file.modifiedOn : new Date();
      event.file.modifiedBy = event.file.modifiedBy ? event.file.modifiedBy : this._post.modifiedBy;
    }
    this.attachments.push(event.file);
    // this._snackbarService.success(`Please submit the form to save the changes`);
    this.isUploadInProgress = false;
    this.postForm.markAsDirty();
  }

  removeAttachment(event) {
    this.attachments = this.attachments.filter(attachment => attachment.fileIdentifier != event.file.fileIdentifier);
    this.postForm.markAsDirty();
    if (event && event.isPreview) {
      this._snackbarService.success("Please submit the form to save the changes");
    }
  }

  updateProgress(event) {
    this.isUploadInProgress = true;
  }
  // End of public methods
}
