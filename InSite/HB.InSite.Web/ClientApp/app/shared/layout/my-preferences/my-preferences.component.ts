import { select } from "@angular-redux/store";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatAutocompleteSelectedEvent, MatDialog } from "@angular/material";
import { Observable, of } from "rxjs";
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil } from "rxjs/operators";

import { Category } from "../../../core/models/category";
import { Preferences, User } from "../../../core/models/user";
import { CategoryService } from "../../../core/services/category.service";
import { PropertyService } from "../../../core/services/property.service";
import { SnackbarService } from "../../../core/services/snackbar.service";
import { UserService } from "../../../core/services/user.service";
import { BaseComponent } from "../../base-component";
import { ModelDialogComponent } from "../../components/model-dialog/model-dialog.component";

@Component({
  selector: "app-my-preferences",
  templateUrl: "./my-preferences.component.html",
  styleUrls: ["./my-preferences.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class MyPreferencesComponent extends BaseComponent implements OnInit {
  private _user: User;
  private _preferences: Preferences;
  private _isUpdate: boolean = false;

  public preferencesForm: FormGroup;

  public propertyControl: FormControl;
  public properties: Array<any>;
  public selectedProperties: Array<any> = [];
  public filteredProperties: Observable<any[]>;
  public propertyLoader: boolean = false;

  public locationControl: FormControl;
  public locations: Array<any>;
  public locationLoader: boolean = false;
  public selectedLocations: Array<any> = [];
  public filteredLocations: Observable<any[]>;

  public categories: Array<Category> = [];

  public associateControl: FormControl;
  public associateLoader: boolean = false;
  public filteredAssociates: Observable<any[]>;
  public selectedAssociates: Array<any> = [];
  public associates: Array<any>;
  public isLoading: boolean = true;

  @select(["identity", "user"])
  User$: Observable<User>;

  constructor(
    private _fb: FormBuilder,
    private _propertyService: PropertyService,
    private _categoryService: CategoryService,
    private _userService: UserService,
    private _dialog: MatDialog,
    private _snackbar: SnackbarService
  ) {
    super();
    this.properties = [];
    this.locations = [];
    this._preferences = new Preferences();

    this.propertyControl = new FormControl();
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

    this.locationControl = new FormControl();
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

    this.associateControl = new FormControl();
    this.filteredAssociates = this.associateControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(value => {
        const trimmedValue: string = value ? value.trim() : "";
        if (trimmedValue.length >= 3) {
          this.associateLoader = true;
          return this._getAssociatesByName(value);
        } else {
          return Observable.of([]);
        }
      })
    );
  }

  private _initForm() {
    this.preferencesForm = this._fb.group({
      notificationsEnabled: "",
      categoriesEnabled: "",
      venueResearch: "",
      propertiesEnabled: "",
      locationsEnabled: "",
      associatesEnabled: "",
      sendImmediate: "",
      sendSummary: "",
      sendSummaryChoice: ""
    });
  }

  private _addToSelectedProperty(property) {
    this.selectedProperties.push(property);
    this.selectedProperties.sort((a, b) => {
      return a.propertyName > b.propertyName ? 1 : -1;
    });
    this.propertyControl.reset();
    this.preferencesForm.markAsDirty();
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

  private _getLocationsByName(searchText: string) {
    return this._propertyService.getLocationsByName(searchText).pipe(
      map(response => {
        const selectedLocationIds = this.selectedLocations.map(({ id }) => id);
        if (response) {
          this.locations = response.filter(location => selectedLocationIds.indexOf(location.locationId) === -1);
        }
        this.locationLoader = false;
        return this.locations;
      })
    );
  }

  private _getAssociatesByName(searchText: string) {
    return this._userService.getUsersByName(searchText).pipe(
      map(response => {
        const selectedUserIds = this.selectedAssociates.map(({ id }) => id);
        if (response) {
          this.associates = response.filter(associate => selectedUserIds.indexOf(associate.id) === -1);
        }
        this.associateLoader = false;
        return this.associates;
      })
    );
  }

  private _updateFromGroup() {
    this.categories.map(category => {
      let controlName = "category" + category.id;
      this.preferencesForm.addControl(controlName, new FormControl(""));
    });
  }

  private _updateFormFields(preferences: Preferences) {
    this.preferencesForm.get("notificationsEnabled").setValue(preferences ? preferences.notificationsEnabled : false);
    this.preferencesForm.get("categoriesEnabled").setValue(preferences ? preferences.categoriesEnabled : false);
    this.preferencesForm.get("propertiesEnabled").setValue(preferences ? preferences.propertiesEnabled : false);
    this.preferencesForm.get("locationsEnabled").setValue(preferences ? preferences.locationsEnabled : false);
    this.preferencesForm.get("associatesEnabled").setValue(preferences ? preferences.associatesEnabled : false);
    this.preferencesForm.get("sendImmediate").setValue(preferences ? preferences.sendImmediate : false);
    this.preferencesForm
      .get("sendSummary")
      .setValue(preferences ? (preferences.sendSummary === 0 ? false : true) : false);
    this.preferencesForm.get("sendSummaryChoice").setValue(preferences ? preferences.sendSummary.toString() : false);

    this.categories.map(category => {
      if (
        this._preferences.emailPreferenceCategories &&
        this._preferences.emailPreferenceCategories.find(p => p.categoryId === category.id)
      ) {
        this.preferencesForm.get("category" + category.id).setValue(true);
      } else {
        this.preferencesForm.get("category" + category.id).setValue(false);
      }
    });

    this.selectedAssociates = [];
    if (this._preferences.emailPreferenceAssociates) {
      this._preferences.emailPreferenceAssociates.map(preferenceAssociate => {
        this.selectedAssociates.push(preferenceAssociate.associateUser);
      });
    }

    this.selectedLocations = [];
    if (this._preferences.emailPreferenceLocations) {
      this._preferences.emailPreferenceLocations.map(preferenceLocation => {
        this.selectedLocations.push(preferenceLocation.location);
      });
    }

    this.selectedProperties = [];
    if (this._preferences.emailPreferenceProperties) {
      this._preferences.emailPreferenceProperties.map(preferenceProperty => {
        this.selectedProperties.push(preferenceProperty.property);
      });
    }
  }

  private _save() {
    this._userService
      .saveUserPreferences(this._preferences, this._isUpdate)
      .pipe(takeUntil(this._destructor$))
      .subscribe(response => {
        if (response instanceof HttpErrorResponse) {
          this._snackbar.error("Unable to save preferences");
        } else {
          this._snackbar.success("Your email preferences have been saved");
          this._preferences = response;
          this.preferencesForm.markAsPristine();
        }
      });
  }

  ngOnInit() {
    this._categoryService
      .getAllCategories()
      .pipe(takeUntil(this._destructor$))
      .subscribe(categories => {
        this.categories = categories;
        this._updateFromGroup();
      });
    this._initForm();

    this.User$.pipe(
      distinctUntilChanged(),
      filter(u => u != null)
    )
      .switchMap(u => {
        this._user = u;
        return this._userService.getUserPreferences(this._user.id).pipe(takeUntil(this._destructor$));
      })
      .subscribe(preferences => {
        this.isLoading = false;
        if (preferences instanceof HttpErrorResponse) {
          this._snackbar.error("Unable to load preferences.");
        } else {
          if (preferences) {
            this._isUpdate = true;
            this._preferences = preferences;
          }
          this._updateFormFields(preferences);
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
    this.preferencesForm.markAsDirty();
  }

  locationSelected(selected: MatAutocompleteSelectedEvent) {
    const selectedIndex = this.locations.findIndex(location => location.locationId === selected.option.value);
    this.selectedLocations.push(this.locations[selectedIndex]);
    this.selectedLocations.sort((a, b) => (a.name > b.name ? 1 : -1));
    this.locationControl.reset();
    this.preferencesForm.markAsDirty();
  }

  removeSelectedLocation(id: number) {
    const index = this.selectedLocations.findIndex(chip => chip.id === id);
    this.selectedLocations.splice(index, 1);
    this.preferencesForm.markAsDirty();
  }

  associateSelected(selected: MatAutocompleteSelectedEvent) {
    const selectedIndex = this.associates.findIndex(associate => associate.id === selected.option.value);
    this.selectedAssociates.push(this.associates[selectedIndex]);
    this.selectedAssociates.sort((a, b) => (a.name > b.name ? 1 : -1));
    this.associateControl.reset();
    this.preferencesForm.markAsDirty();
  }

  removeSelectedAssociate(id: number) {
    const index = this.selectedAssociates.findIndex(chip => chip.id === id);
    this.selectedAssociates.splice(index, 1);
    this.preferencesForm.markAsDirty();
  }

  onSubmit() {
    this._preferences.emailPreferenceId = this._preferences.emailPreferenceId ? this._preferences.emailPreferenceId : 0;
    this._preferences.categoriesEnabled = this.preferencesForm.get("categoriesEnabled").value;
    this._preferences.propertiesEnabled = this.preferencesForm.get("propertiesEnabled").value;
    this._preferences.locationsEnabled = this.preferencesForm.get("locationsEnabled").value;
    this._preferences.associatesEnabled = this.preferencesForm.get("associatesEnabled").value;
    this._preferences.sendImmediate = this.preferencesForm.get("sendImmediate").value;
    this._preferences.notificationsEnabled = this.preferencesForm.get("notificationsEnabled").value;
    this._preferences.sendSummary = this.preferencesForm.get("sendSummary").value
      ? this.preferencesForm.get("sendSummaryChoice").value
      : 0;

    this._preferences.emailPreferenceLocations = [];
    this.selectedLocations.map(location => {
      this._preferences.emailPreferenceLocations.push(location.locationId);
    });

    this._preferences.emailPreferenceAssociates = [];
    this.selectedAssociates.map(associate => {
      this._preferences.emailPreferenceAssociates.push(associate.id);
    });

    this._preferences.emailPreferenceProperties = [];
    this.selectedProperties.map(property => {
      this._preferences.emailPreferenceProperties.push(property.propertyId);
    });

    this._preferences.emailPreferenceCategories = [];
    this.categories.map(category => {
      if (this.preferencesForm.get("category" + category.id).value) {
        this._preferences.emailPreferenceCategories.push(category.id);
      }
    });

    if (
      (this._preferences.categoriesEnabled ||
        this._preferences.associatesEnabled ||
        this._preferences.locationsEnabled ||
        this._preferences.propertiesEnabled) &&
      !this._preferences.sendImmediate &&
      this._preferences.sendSummary === 0
    ) {
      let dialogRef = this._dialog.open(ModelDialogComponent, {
        width: "600px",
        data: {
          name:
            "Warning: You have not enabled any email delivery options resulting in no emails matching your preferences.",
          okName: "Ok",
          hideNo: true
        }
      });

      dialogRef
        .afterClosed()
        .pipe(
          takeUntil(this._destructor$),
          filter(result => result)
        )
        .subscribe(result => {
          if (result instanceof HttpErrorResponse) {
            this._snackbar.error(result.error);
          } else {
            this._save();
          }
        });
    } else {
      this._save();
    }
  }

  onCancel() {
    this._updateFormFields(this._preferences);
    this.preferencesForm.markAsPristine();
  }
}
