import { select } from "@angular-redux/store";
import { Component, Injectable, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material";
import { ActivatedRoute, ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { switchMap, takeUntil } from "rxjs/operators";

import { SnackbarType } from "../../core/models/snackbar-type";
import { User } from "../../core/models/user";
import { SnackbarService } from "../../core/services/snackbar.service";
import { BaseComponent } from "../../shared/base-component";
import { ModelDialogComponent } from "../../shared/components/model-dialog/model-dialog.component";
import { AdminService } from "../services/admin.service";

@Component({
  selector: "app-synonyms",
  templateUrl: "./synonyms.component.html",
  styleUrls: ["./synonyms.component.scss"]
})
export class SynonymsComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _synonyms: any;
  private _isEditing: number = -2;
  public defaultValues = {
    synonymId: 0,
    vSearch: "",
    vSynonyms: "",
    active: 1
  };
  // End of Private Fields

  // Public properties
  public isHybridApp: boolean;
  public synonymsList: any;
  public synonymsForm: FormGroup;
  public editorOptions: any;
  public userlist: Array<any>;
  get isEditing(): number {
    return this._isEditing;
  }

  @select(["settings", "values"])
  settings$: Observable<Array<any>>;
  categoryList;
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
    private _synonymsService: AdminService
  ) {
    super();
  }
  // End of constructor

  // Private methods
  private _initForm() {
    this.synonymsForm = this._fb.group(this.defaultValues);
  }

  private _updateSynonymsValues() {
    this._synonyms.syID = this.synonymsForm.get("synonymId").value;
    this._synonyms.vSearch = this.synonymsForm.get("vSearch").value;
    this._synonyms.vSynonyms = this.synonymsForm.get("vSynonyms").value;
    this._synonyms.activeStatus = this.synonymsForm.get("active").value;
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this.isHybridApp = window["isHybridApp"];
    this._activatedRoute.url.subscribe(urlComponents => {
      let key = urlComponents[0].path.replace(/(?:^|\s)[a-z]/g, m => m.toUpperCase());
      //this._synonymsType = SynonymsType[key];
    });
    const routeSubscription$ = this._activatedRoute.params.pipe(takeUntil(this._destructor$));
    const dataSubscriptions$ = this._activatedRoute.data.pipe(takeUntil(this._destructor$));

    Observable.combineLatest(routeSubscription$, dataSubscriptions$)
      .pipe(takeUntil(this._destructor$))
      .subscribe(values => {
        const params = values[0];
        const data = values[1].data ? values[1].data : values[1].userListData;
        this._initForm();
        this.synonymsList = data.error ? [this.defaultValues] : data;
        this._isEditing = -2;
      });
  }

  cancel() {
    this._synonyms = this.defaultValues;
    this.synonymsForm.reset(this.defaultValues);
    this._isEditing = -2;
  }

  editSynonym(synonym, index) {
    this._synonyms = synonym;
    this._isEditing = index;
    this.synonymsForm.get("synonymId").setValue(this._synonyms.syID);
    this.synonymsForm.get("vSearch").setValue(this._synonyms.vSearch);
    this.synonymsForm.get("vSynonyms").setValue(this._synonyms.vSynonyms);
    this.synonymsForm.get("active").setValue(this._synonyms.activeStatus);
  }

  deleteSynonym(synonym, index) {
    this._synonyms = synonym;

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
            this._synonyms.active = false;
            return this._synonymsService.deleteSynonym(this._synonyms.synonymId.toString());
          }
          return;
        })
      )
      .subscribe(response => {
        this._snackbarService.success("Synonym deleted successfully", SnackbarType.Success);
        this.synonymsList = this.synonymsList.filter(item => item !== this._synonyms);
      });
  }

  onSubmit() {
    if (!this.synonymsForm.valid) {
      this._snackbarService.error("Please fix the errors");
      return;
    }

    this._updateSynonymsValues();
    this._isEditing = -2;

    this._synonymsService
      .saveSynonym([this._synonyms])
      .pipe(takeUntil(this._destructor$))
      .subscribe(response => {
        if (!response || (response && !response.error)) {
          this._snackbarService.success("Synonyms updated successfully", SnackbarType.Success);
          if (this._synonyms.synonymId == 0) {
            this.synonymsList.unshift(response);
          } else {
            this._synonyms = response;
          }
        }
      });
  }

  // End of public methods
}

@Injectable()
export class SynonymsResolver implements Resolve<any> {
  constructor(private _adminService: AdminService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this._adminService.getSynonymsSettings();
  }
}
