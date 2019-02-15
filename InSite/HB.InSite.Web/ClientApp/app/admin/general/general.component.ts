import { select } from "@angular-redux/store";
import { Component, Injectable, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { SnackbarType } from "../../core/models/snackbar-type";
import { User } from "../../core/models/user";
import { SettingsService } from "../../core/services/settings.service";
import { SnackbarService } from "../../core/services/snackbar.service";
import { BaseComponent } from "../../shared/base-component";
import { AdminService } from "../services/admin.service";

@Component({
  selector: "app-general",
  templateUrl: "./general.component.html",
  styleUrls: ["./general.component.scss"]
})
export class GeneralComponent extends BaseComponent implements OnInit {
  applicationSettings: any;
  @select(["identity", "user"])
  User$: Observable<User>;
  // Private Fields

  private _isEditable: boolean = false;
  private defaultValues = {
    AdImgContainer: "",
    azureAdImgConnection: "",
    azureConnection: "",
    attachContainer: "",
    insightApiKey: "",
    insightWebKey: "",
    uploadApiUrl: "",
    fileSizeKB: "",
    uploadLimit: "",
    imageUploadLimit: "",
    imgContainer: "",
    blobUploadPath: "",
    missingHotelEmail: "",
    missingHotelSubject: "",
    minCharToSearch: "",
    searchItemLimit: ""
  };
  // End of Private Fields

  // Public properties
  public isHybridApp: boolean;
  public generalForm: FormGroup;
  public generalSettings: any;
  public editorOptions: any;
  public userlist: Array<any>;
  get isEditable(): boolean {
    return this._isEditable;
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
    private _router: Router,
    private _snackbarService: SnackbarService,
    private _generalService: SettingsService
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
    this.generalForm = this._fb.group(this.defaultValues);
  }

  private _updateGeneralValues() {
    this.generalSettings.filter(function(value) {
      return value.name.indexOf("AdImg:ConnectionString") > -1;
    })[0].value = this.generalForm.get("azureAdImgConnection").value;
    this.generalSettings.filter(function(value) {
      return value.name.indexOf("AdImg:Container") > -1;
    })[0].value = this.generalForm.get("AdImgContainer").value;
    this.generalSettings.filter(function(value) {
      return value.name.indexOf("ConnectionString") > -1;
    })[0].value = this.generalForm.get("azureConnection").value;
    this.generalSettings.filter(function(value) {
      return value.name.indexOf("BlobStorage:Container") > -1;
    })[0].value = this.generalForm.get("attachContainer").value;
    this.generalSettings.filter(function(value) {
      return value.name.indexOf("ApiKey") > -1;
    })[0].value = this.generalForm.get("insightApiKey").value;
    this.generalSettings.filter(function(value) {
      return value.name.indexOf("WebKey") > -1;
    })[0].value = this.generalForm.get("insightWebKey").value;
    this.generalSettings.filter(function(value) {
      return value.name.indexOf("UploadFileEndpoint") > -1;
    })[0].value = this.generalForm.get("uploadApiUrl").value;
    this.generalSettings.filter(function(value) {
      return value.name.indexOf("UploadFileMaxSize") > -1;
    })[0].value = this.generalForm.get("fileSizeKB").value;
    this.generalSettings.filter(function(value) {
      return value.name.indexOf("UploadFileSelectionLimit") > -1;
    })[0].value = this.generalForm.get("uploadLimit").value;
    this.generalSettings.filter(function(value) {
      return value.name.indexOf("UploadImageSelectionLimit") > -1;
    })[0].value = this.generalForm.get("imageUploadLimit").value;
    this.generalSettings.filter(function(value) {
      return value.name.indexOf("ImagesContainer") > -1;
    })[0].value = this.generalForm.get("imgContainer").value;
    this.generalSettings.filter(function(value) {
      return value.name.indexOf("BlobStorage:Path") > -1;
    })[0].value = this.generalForm.get("blobUploadPath").value;
    this.generalSettings.filter(function(value) {
      return value.name.indexOf("MissingHotelEmail:Address") > -1;
    })[0].value = this.generalForm.get("missingHotelEmail").value;
    this.generalSettings.filter(function(value) {
      return value.name.indexOf("MissingHotelEmail:Subject") > -1;
    })[0].value = this.generalForm.get("missingHotelSubject").value;
    this.generalSettings.filter(function(value) {
      return value.name.indexOf("Search:Characters") > -1;
    })[0].value = this.generalForm.get("minCharToSearch").value;
    this.generalSettings.filter(function(value) {
      return value.name.indexOf("Search:Results") > -1;
    })[0].value = this.generalForm.get("searchItemLimit").value;
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this.isHybridApp = window["isHybridApp"];
    this._activatedRoute.url.subscribe(urlComponents => {
      let key = urlComponents[0].path.replace(/(?:^|\s)[a-z]/g, m => m.toUpperCase());
      //this._generalType = GeneralType[key];
    });
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
        this.applicationSettings = data ? data : this.defaultValues;
        this.generalSettings = this.applicationSettings.filter(function(value) {
          return !(
            value.name.split(":")[0].indexOf("Expiration") > -1 || value.name.split(":")[0].indexOf("Point") > -1
          );
        });

        this.generalForm.get("azureAdImgConnection").setValue(
          this.generalSettings.filter(function(value) {
            return value.name.indexOf("AdImg:ConnectionString") > -1;
          })[0].value
        );
        this.generalForm.get("AdImgContainer").setValue(
          this.generalSettings.filter(function(value) {
            return value.name.indexOf("AdImg:Container") > -1;
          })[0].value
        );
        this.generalForm.get("azureConnection").setValue(
          this.generalSettings.filter(function(value) {
            return value.name.indexOf("ConnectionString") > -1;
          })[0].value
        );
        this.generalForm.get("attachContainer").setValue(
          this.generalSettings.filter(function(value) {
            return value.name.indexOf("BlobStorage:Container") > -1;
          })[0].value
        );
        this.generalForm.get("insightApiKey").setValue(
          this.generalSettings.filter(function(value) {
            return value.name.indexOf("ApiKey") > -1;
          })[0].value
        );
        this.generalForm.get("insightWebKey").setValue(
          this.generalSettings.filter(function(value) {
            return value.name.indexOf("WebKey") > -1;
          })[0].value
        );
        this.generalForm.get("uploadApiUrl").setValue(
          this.generalSettings.filter(function(value) {
            return value.name.indexOf("UploadFileEndpoint") > -1;
          })[0].value
        );
        this.generalForm.get("fileSizeKB").setValue(
          this.generalSettings.filter(function(value) {
            return value.name.indexOf("UploadFileMaxSize") > -1;
          })[0].value
        );
        this.generalForm.get("uploadLimit").setValue(
          this.generalSettings.filter(function(value) {
            return value.name.indexOf("UploadFileSelectionLimit") > -1;
          })[0].value
        );
        this.generalForm.get("imageUploadLimit").setValue(
          this.generalSettings.filter(function(value) {
            return value.name.indexOf("UploadImageSelectionLimit") > -1;
          })[0].value
        );
        this.generalForm.get("imgContainer").setValue(
          this.generalSettings.filter(function(value) {
            return value.name.indexOf("ImagesContainer") > -1;
          })[0].value
        );
        this.generalForm.get("blobUploadPath").setValue(
          this.generalSettings.filter(function(value) {
            return value.name.indexOf("BlobStorage:Path") > -1;
          })[0].value
        );
        this.generalForm.get("missingHotelEmail").setValue(
          this.generalSettings.filter(function(value) {
            return value.name.indexOf("MissingHotelEmail:Address") > -1;
          })[0].value
        );
        this.generalForm.get("missingHotelSubject").setValue(
          this.generalSettings.filter(function(value) {
            return value.name.indexOf("MissingHotelEmail:Subject") > -1;
          })[0].value
        );
        this.generalForm.get("minCharToSearch").setValue(
          this.generalSettings.filter(function(value) {
            return value.name.indexOf("Search:Characters") > -1;
          })[0].value
        );
        this.generalForm.get("searchItemLimit").setValue(
          this.generalSettings.filter(function(value) {
            return value.name.indexOf("Search:Results") > -1;
          })[0].value
        );
      });
  }

  getDescription(name: string) {
    return this.generalSettings.filter(function(value) {
      return value.name.indexOf(name) > -1;
    })[0].description;
  }
  onSubmit() {
    if (!this.generalForm.valid) {
      this._snackbarService.error("Please fix the errors");
      return;
    }

    this._updateGeneralValues();

    this._generalService
      .bulkUpdateSettings(this.generalSettings)
      .pipe(takeUntil(this._destructor$))
      .subscribe(response => {
        if (!response || (response && !response.error)) {
          this._snackbarService.success("General setting(s) updated successfully", SnackbarType.Success);
          this._router.navigateByUrl("/");
        }
      });
  }

  cancel() {
    //this.generalForm.reset(this.defaultValues);

    //TODO : navigate to previous route.
    this._router.navigateByUrl("/admin");
  }
  // End of public methods
}

@Injectable()
export class GeneralResolver implements Resolve<any> {
  constructor(private _adminService: AdminService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this._adminService.getGeneralSettings();
  }
}
