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
  selector: "app-expirations",
  templateUrl: "./expirations.component.html",
  styleUrls: ["./expirations.component.scss"]
})
export class ExpirationsComponent extends BaseComponent implements OnInit {
  @select(["identity", "user"])
  User$: Observable<User>;
  // Private Fields
  private _user: User;
  private _expirationsId: number;
  private _isEditable: boolean = false;
  private _isLoading: boolean;
  private defaultValues = {
    Inspection: 0,
    ClientReview: 0,
    Review: 0,
    ReviewRequestDays: 0,
    UnansweredQuestionDays: 0,
    UnansweredQuestionCount: 0,
    PromptReview: 0,
    ReviewRequestCount: 0,
    ReviewRequestDelete: 0
  };
  // End of Private Fields

  // Public properties
  public isHybridApp: boolean;
  public expirationSettings: any;
  public expirationsForm: FormGroup;
  public editorOptions: any;
  public expirations: any;
  public userlist: Array<any>;
  get isEditable(): boolean {
    return this._isEditable;
  }

  @select(["settings", "values"])
  settings$: Observable<Array<any>>;
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
    private _applicationSettings: SettingsService
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
    this.expirationsForm = this._fb.group(this.defaultValues);
  }

  private _updateExpirationsValues() {
    this.expirationSettings.filter(function(value) {
      return value.name.indexOf("Inspection") > -1;
    })[0].value = this.expirationsForm.get("Inspection").value + "";

    this.expirationSettings.filter(function(value) {
      return value.name.indexOf("ClientReview") > -1;
    })[0].value = this.expirationsForm.get("ClientReview").value + "";

    this.expirationSettings.find(value => value.name == "Expiration:Review").value =
      this.expirationsForm.get("Review").value + "";

    this.expirationSettings.filter(function(value) {
      return value.name.indexOf("ReviewRequestDays") > -1;
    })[0].value = this.expirationsForm.get("ReviewRequestDays").value + "";

    this.expirationSettings.filter(function(value) {
      return value.name.indexOf("UnansweredQuestionDays") > -1;
    })[0].value = this.expirationsForm.get("UnansweredQuestionDays").value + "";

    this.expirationSettings.filter(function(value) {
      return value.name.indexOf("UnansweredQuestionCount") > -1;
    })[0].value = this.expirationsForm.get("UnansweredQuestionCount").value + "";
    this.expirationSettings.filter(function(value) {
      return value.name.indexOf("PromptReview") > -1;
    })[0].value = this.expirationsForm.get("PromptReview").value + "";
    this.expirationSettings.filter(function(value) {
      return value.name.indexOf("ReviewRequestCount") > -1;
    })[0].value = this.expirationsForm.get("ReviewRequestCount").value + "";
    this.expirationSettings.filter(function(value) {
      return value.name.indexOf("ReviewRequestDelete") > -1;
    })[0].value = this.expirationsForm.get("ReviewRequestDelete").value + "";
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this.isHybridApp = window["isHybridApp"];
    this._activatedRoute.url.subscribe(urlComponents => {
      let key = urlComponents[0].path.replace(/(?:^|\s)[a-z]/g, m => m.toUpperCase());
      //this._expirationsType = ExpirationsType[key];
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
        this.expirations = {};
        this._initForm();
        this.expirationSettings = data ? data : this.defaultValues;
        this.expirationSettings.forEach((expire, key) => {
          this.expirations[expire.name.split(":")[1]] = expire;
        });

        this.expirationsForm.get("Inspection").setValue(
          parseInt(
            this.expirationSettings.filter(function(value) {
              return value.name.indexOf("Inspection") > -1;
            })[0].value
          )
        );
        this.expirationsForm.get("ClientReview").setValue(
          parseInt(
            this.expirationSettings.filter(function(value) {
              return value.name.indexOf("ClientReview") > -1;
            })[0].value
          )
        );
        this.expirationsForm
          .get("Review")
          .setValue(parseInt(this.expirationSettings.find(value => value.name == "Expiration:Review").value));
        this.expirationsForm.get("ReviewRequestDays").setValue(
          parseInt(
            this.expirationSettings.filter(function(value) {
              return value.name.indexOf("ReviewRequestDays") > -1;
            })[0].value
          )
        );
        this.expirationsForm.get("UnansweredQuestionDays").setValue(
          parseInt(
            this.expirationSettings.filter(function(value) {
              return value.name.indexOf("UnansweredQuestionDays") > -1;
            })[0].value
          )
        );
        this.expirationsForm.get("UnansweredQuestionCount").setValue(
          parseInt(
            this.expirationSettings.filter(function(value) {
              return value.name.indexOf("UnansweredQuestionCount") > -1;
            })[0].value
          )
        );
        this.expirationsForm.get("PromptReview").setValue(
          parseInt(
            this.expirationSettings.filter(function(value) {
              return value.name.indexOf("PromptReview") > -1;
            })[0].value
          )
        );
        this.expirationsForm.get("ReviewRequestCount").setValue(
          parseInt(
            this.expirationSettings.filter(function(value) {
              return value.name.indexOf("ReviewRequestCount") > -1;
            })[0].value
          )
        );
        this.expirationsForm.get("ReviewRequestDelete").setValue(
          parseInt(
            this.expirationSettings.filter(function(value) {
              return value.name.indexOf("ReviewRequestDelete") > -1;
            })[0].value
          )
        );
      });
  }
  getDescription(name: string) {
    return this.expirationSettings.find(value => value.name == "Expiration:" + name).description;
  }
  onSubmit() {
    if (!this.expirationsForm.valid) {
      this._snackbarService.error("Please fix the errors");
      return;
    }
    //this._expirations.active = true;
    //this._expirations.archive = false;

    this._updateExpirationsValues();

    this._applicationSettings
      .bulkUpdateSettings(this.expirationSettings)
      .pipe(takeUntil(this._destructor$))
      .subscribe(response => {
        if (!response || (response && !response.error)) {
          this._snackbarService.success("Expiration(s) updated successfully", SnackbarType.Success);
          this._router.navigateByUrl("/admin");
        }
      });
  }

  cancel() {
    this.expirationsForm.reset(this.defaultValues);

    //TODO : navigate to previous route.
    this._router.navigateByUrl("/admin");
  }
  // End of public methods
}

@Injectable()
export class ExpirationsResolver implements Resolve<any> {
  constructor(private _adminService: AdminService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this._adminService.getExpirationsSettings();
  }
}
