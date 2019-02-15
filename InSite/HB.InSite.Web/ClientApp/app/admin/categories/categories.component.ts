import { select } from "@angular-redux/store";
import { Component, Injectable, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material";
import { ActivatedRoute, ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { switchMap, takeUntil } from "rxjs/operators";

import { Category } from "../../core/models/category";
import { SnackbarType } from "../../core/models/snackbar-type";
import { User } from "../../core/models/user";
import { CategoryService } from "../../core/services/category.service";
import { SnackbarService } from "../../core/services/snackbar.service";
import { BaseComponent } from "../../shared/base-component";
import { ModelDialogComponent } from "../../shared/components/model-dialog/model-dialog.component";

@Component({
  selector: "app-categories",
  templateUrl: "./categories.component.html",
  styleUrls: ["./categories.component.scss"]
})
export class CategoriesComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _category: any;
  private _isEditing: number = -2;
  // End of Private Fields

  // Public properties
  public isHybridApp: boolean;
  public categoryForm: FormGroup;
  public editorOptions: any;
  public userlist: Array<any>;
  public postType: any;
  public categories: Array<any>;
  public defaultValues = {
    id: 0,
    name: "",
    expirationInMonths: 0,
    expirationPromptInDays: 0,
    active: true
  };

  get isEditing(): number {
    return this._isEditing;
  }

  @select(["identity", "user"])
  User$: Observable<User>;

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
    private _snackbarService: SnackbarService,
    private _dialog: MatDialog,
    private _categoriesService: CategoryService
  ) {
    super();
  }
  // End of constructor

  // Private methods
  private _initForm() {
    this.categoryForm = this._fb.group(this.defaultValues);
  }

  private _updateCategoriesValues() {
    if (!this._category) {
      this._category = new Category();
    }
    this._category.name = this.categoryForm.get("name").value;
    this._category.expirationInMonths = this.categoryForm.get("expirationInMonths").value;
    this._category.expirationPromptInDays = this.categoryForm.get("expirationPromptInDays").value;
    this._category.active = this.categoryForm.get("active").value;
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this.isHybridApp = window["isHybridApp"];

    const routeSubscription$ = this._activatedRoute.params.pipe(takeUntil(this._destructor$));
    const dataSubscriptions$ = this._activatedRoute.data.pipe(takeUntil(this._destructor$));

    Observable.combineLatest(routeSubscription$, dataSubscriptions$)
      .pipe(takeUntil(this._destructor$))
      .subscribe(values => {
        const data = values[1].data ? values[1].data : values[1].categories;
        this._initForm();
        this.categories = data.data ? data.data : data;
      });
  }

  editCategory(category, index) {
    this.categoryForm.reset();
    this._isEditing = index;

    this.categoryForm = this._fb.group(this.defaultValues);
    if (index >= 0) {
      this._category = category;
      this.categoryForm.get("name").setValue(category.name);
      this.categoryForm.get("expirationInMonths").setValue(category.expirationInMonths);
      this.categoryForm.get("expirationPromptInDays").setValue(category.expirationPromptInDays);
      this.categoryForm.get("active").setValue(category.active);
    }
  }

  deleteCategory(category) {
    this._category = category;

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
            this._category.active = false;
            return this._categoriesService.deleteCategory(this._category.id.toString());
          }
          return;
        })
      )
      .subscribe(response => {
        this._snackbarService.success("Category deleted successfully", SnackbarType.Success);
        this.categories = this.categories.filter(item => item !== this._category);
      });
  }

  cancel() {
    this.categoryForm.reset(this.defaultValues);
    this._isEditing = -2;
  }

  onSubmit() {
    if (!this.categoryForm.valid) {
      this._snackbarService.error("Please fix the errors");
      return;
    }

    this._updateCategoriesValues();
    const isUpdate = this._category.id > 0;
    this._categoriesService
      .updateCategory(this._category)
      .pipe(takeUntil(this._destructor$))
      .subscribe(response => {
        if (!response || (response && !response.error)) {
          if (isUpdate) {
            this._snackbarService.success("Category updated successfully");
          } else {
            this.categories.unshift(response);

            this._snackbarService.success("Category added successfully");
          }
          this.categories.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
          this.categoryForm.reset();
        } else {
          this._snackbarService.error("Error while saving category");
        }
      });
  }

  // End of public methods
}

@Injectable()
export class CategoriesResolver implements Resolve<any> {
  constructor(private _categoriesService: CategoryService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this._categoriesService.getAllCategories();
  }
}
