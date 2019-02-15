import { select } from "@angular-redux/store";
import { Component, Injectable, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material";
import { ActivatedRoute, ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { switchMap, takeUntil } from "rxjs/operators";

import * as constants from "../../app.constants";
import { SnackbarType } from "../../core/models/snackbar-type";
import { User } from "../../core/models/user";
import { SnackbarService } from "../../core/services/snackbar.service";
import { BaseComponent } from "../../shared/base-component";
import { ModelDialogComponent } from "../../shared/components/model-dialog/model-dialog.component";
import { NativeScriptInterfaceService } from "../../shared/services/native-script-interface.service";
import { AdminService } from "../services/admin.service";

@Component({
  selector: "app-advertisements",
  templateUrl: "./advertisements.component.html",
  styleUrls: ["./advertisements.component.scss"]
})
export class AdvertisementsComponent extends BaseComponent implements OnInit {
  filePath: string;
  @select(["identity", "user"])
  User$: Observable<User>;
  // Private Fields
  private _attachments: any;
  private _user: User;
  private _advertisementsId: number;
  private _advertisements: any;
  private _isEditing: number = -2;
  private _isLoading: boolean;
  public defaultValues = {
    singleFile: null,
    advertisementId: 0,
    imageURL: "",
    navigateURL: "",
    toolTipText: "",
    active: true
  };
  // End of Private Fields

  // Public properties
  public maxFileLength: number;
  public maxNoFiles: number = 1;
  public uploadURL: string;
  public isHybridApp: boolean;
  public adsList: any;
  public advertisementsForm: FormGroup;
  public editorOptions: any;
  public userlist: Array<any>;
  get isEditing(): number {
    return this._isEditing;
  }

  get attachments(): Array<any> {
    this._advertisements.attachments = this._advertisements.attachments ? this._advertisements.attachments : [];
    this._attachments = this._attachments ? this._attachments : this._advertisements.attachments;
    return this._attachments;
  }
  set attachments(value: Array<any>) {
    this._attachments = this._advertisements.attachments = value ? value : [];
  }

  @select(["settings", "values"])
  settings$: Observable<Array<any>>;
  postType;
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(
    private _fb: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _snackbarService: SnackbarService,
    private _dialog: MatDialog,
    private nsInterfaceService: NativeScriptInterfaceService,
    private _advertisementsService: AdminService
  ) {
    super();
    //this.User$.pipe(
    //    distinctUntilChanged(),
    //    filter(u => u != null)
    //).subscribe(u => (this._user = u));
  }
  // End of constructor

  // Private methods
  private _initForm() {
    this.advertisementsForm = this._fb.group(this.defaultValues);
  }

  private _updateAdvertisementsValues() {
    //this._advertisements.advertisementId = this.advertisementsForm.get("advertisementId").value;
    this._advertisements.imageURL = this.advertisementsForm.get("imageURL").value;
    this._advertisements.navigateURL = this.advertisementsForm.get("navigateURL").value;
    this._advertisements.toolTipText = this.advertisementsForm.get("toolTipText").value;
    this._advertisements.active = this.advertisementsForm.get("active").value;
  }

  private chooseFile() {
    this.nsInterfaceService.nsEventEmitter({ type: "fileUpload" });
  }

  private _removeUnusedAttachments() {
    this._advertisements.attachments = this._advertisements.attachments.filter(
      attachment => attachment.fileIdentifier !== ""
    );
  }

  // End of private methods

  // Public methods
  ngOnInit() {
    this.isHybridApp = window["isHybridApp"];
    this.settings$.pipe(takeUntil(this._destructor$)).subscribe(settings => {
      if (settings) {
        this.maxFileLength = settings.find(setting => setting.name === "UploadFileMaxSize").value;

        //this.maxNoFiles = settings.find(
        //  setting => setting.name === "UploadFileSelectionLimit"
        //).value;

        this.filePath =
          settings.find(setting => setting.name === "BlobStorage:Path").value +
          "/" +
          settings.find(setting => setting.name === "AdImg:Container").value +
          "/";
      }
    });

    this.uploadURL = constants.apiUrl + "FileUpload/AdUpload";
    this._activatedRoute.url.subscribe(urlComponents => {
      let key = urlComponents[0].path.replace(/(?:^|\s)[a-z]/g, m => m.toUpperCase());
      //this._advertisementsType = AdvertisementsType[key];
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

    const routeSubscription$ = this._activatedRoute.params.pipe(takeUntil(this._destructor$));
    const dataSubscriptions$ = this._activatedRoute.data.pipe(takeUntil(this._destructor$));

    //this._activatedRoute.params
    //    .pipe(
    //        takeUntil(this._destructor$),
    //        switchMap(data => {
    //            return Observable.combineLatest(
    //            );
    //        })
    //    )
    //    .subscribe(response => {
    //        this._isLoading = false;
    //        //this._posts = response[0] && response[0].data ? response[0].data : [];
    //    });

    Observable.combineLatest(routeSubscription$, dataSubscriptions$)
      .pipe(takeUntil(this._destructor$))
      .subscribe(values => {
        const params = values[0];
        const data = values[1].data ? values[1].data : values[1].userListData;
        this._initForm();
        this.adsList = data ? data : this.defaultValues;
        this._isEditing = -2;
      });
  }

  cancel() {
    this._advertisements = this.defaultValues;
    this.advertisementsForm.reset(this.defaultValues);
    this._isEditing = -2;
  }

  editAds(ads, index) {
    this._advertisements = ads;
    this.attachments = ads.attachments;
    this._isEditing = index;
    //this.advertisementsForm.get("advertisementId").setValue(this._advertisements.advertisementId);
    this.advertisementsForm.get("imageURL").setValue(this._advertisements.imageURL);
    this.advertisementsForm.get("navigateURL").setValue(this._advertisements.navigateURL);
    this.advertisementsForm.get("toolTipText").setValue(this._advertisements.toolTipText);
    this.advertisementsForm.get("active").setValue(this._advertisements.active);
  }

  deleteAds(ads, index) {
    this._advertisements = ads;

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
        switchMap(result => {
          if (result) {
            this._advertisements.active = false;
            return this._advertisementsService.deleteAdvertisement(this._advertisements.advertisementId.toString());
          }
          return;
        })
      )
      .subscribe(response => {
        this._snackbarService.success("Advertisement deleted successfully", SnackbarType.Success);
        this.adsList = this.adsList.filter(item => item !== this._advertisements);
      });
  }

  onSubmit() {
    if (!this.advertisementsForm.valid) {
      this._snackbarService.error("Please fix the errors");
      return;
    }

    this._updateAdvertisementsValues();
    this._isEditing = -2;
    this._advertisementsService
      .saveAdvertisement(this._advertisements)
      .pipe(takeUntil(this._destructor$))
      .subscribe(response => {
        if (!response.error) {
          this._snackbarService.success("Advertisements update successfully", SnackbarType.Success);
          if (this._advertisements.advertisementId < 1) {
            this.adsList.unshift(response);
          } else {
            this._advertisements = response;
          }
        }
      });
  }

  addAttachment(event, index) {
    this.attachments = [];
    this.attachments.push(event.file);
    this.advertisementsForm.get("imageURL").setValue(event.file.storageUri);
    this.advertisementsForm.markAsDirty();
  }

  removeAttachment(event?) {
    this._snackbarService.success("Please submit the form to save the changes");
    this.advertisementsForm.markAsDirty();
  }

  // End of public methods
}

@Injectable()
export class AdvertisementsResolver implements Resolve<any> {
  constructor(private _adminService: AdminService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this._adminService.getAdvertisementsSettings();
  }
}
