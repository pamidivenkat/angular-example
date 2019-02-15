import { select } from "@angular-redux/store";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, Injectable, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatAutocompleteSelectedEvent, MatDialog, MatPaginator, MatSort, MatTableDataSource } from "@angular/material";
import { ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from "@angular/router";
import { Observable, of as observableOf } from "rxjs";
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil } from "rxjs/operators";

import { Property } from "../../core/models/property";
import { SnackbarType } from "../../core/models/snackbar-type";
import { User } from "../../core/models/user";
import { PropertyService } from "../../core/services/property.service";
import { SnackbarService } from "../../core/services/snackbar.service";
import { BaseComponent } from "../../shared/base-component";
import { ModelDialogComponent } from "../../shared/components/model-dialog/model-dialog.component";
import { AdminService } from "../services/admin.service";

@Component({
  selector: "app-manage-client-reviews",
  templateUrl: "./manage-client-reviews.component.html",
  styleUrls: ["./manage-client-reviews.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class ManageClientReviewsComponent extends BaseComponent implements OnInit {
  @select(["identity", "user"])
  User$: Observable<User>;
  @select(["settings", "values"])
  settings$: Observable<Array<any>>;
  // Private Fields
  public defaultValues = {
    status: -1,
    propertyControl: 0
  };
  // End of Private Fields

  // Public properties
  public isHybridApp: boolean;
  public clientReviewForm: FormGroup;
  public propertyControl: FormControl;
  public filteredProperties: Observable<any[]>;
  public propertyLoader: boolean = false;
  public selectedProperty: Property;
  public properties: Array<any>;
  public statusList: Array<any> = [{ id: -1, name: "All" }, { id: 1, name: "Active" }, { id: 0, name: "Inactive" }];
  postType;
  data; //DetailedReview ActiveStatus
  displayedColumns: string[] = [
    "PropertyId",
    "ReviewSummary",
    "FullName",
    "OrganizationName",
    "ProgramName",
    "NumberOfAttendees",
    "ReviewId"
  ];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatSort)
  sort: MatSort;
  @ViewChild(MatPaginator)
  paginator: MatPaginator;
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
    private _propertyService: PropertyService,
    private _snackbarService: SnackbarService,
    private _dialog: MatDialog,
    private _adminService: AdminService
  ) {
    super();
    //this.User$.pipe(
    //    distinctUntilChanged(),
    //    filter(u => u != null)
    //).subscribe(u => (this._user = u));

    this.propertyControl = new FormControl();
    this.properties = [];
    this.selectedProperty = new Property();

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
  }
  // End of constructor

  // Private methods
  private _initForm() {
    this.clientReviewForm = this._fb.group(this.defaultValues);
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
  private refreshClientReview(value) {
    this.data = value;
    this.dataSource = new MatTableDataSource<any>(this.data.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.paginator.length = this.paginator._length = this.data.paging.recordCount;
    this.paginator.pageSize = this.data.paging.batchSize;
    this.paginator.pageIndex = this.data.paging.pageIndex;
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this.isHybridApp = window["isHybridApp"];

    this._activatedRoute.url.subscribe(urlComponents => {
      let key = urlComponents[0].path.replace(/(?:^|\s)[a-z]/g, m => m.toUpperCase());
      //this._advertisementsType = AdvertisementsType[key];
    });

    const routeSubscription$ = this._activatedRoute.params.pipe(takeUntil(this._destructor$));
    const dataSubscriptions$ = this._activatedRoute.data.pipe(takeUntil(this._destructor$));

    Observable.combineLatest(routeSubscription$, dataSubscriptions$)
      .pipe(takeUntil(this._destructor$))
      .subscribe(values => {
        const params = values[0];
        const initValue =
          values[1].data && values[1].data.data
            ? values[1].data
            : [
                {
                  data: [],
                  paging: {
                    maxId: 0,
                    pageIndex: 0,
                    batchSize: 10,
                    recordCount: 0
                  }
                }
              ];
        this._initForm();
        this.refreshClientReview(initValue);
        this.paginator.page.subscribe(values => {
          this.search();
        });
        this.sort.sortChange.subscribe(values => {
          this.search();
        });
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  propertySelected(selected: MatAutocompleteSelectedEvent) {
    const index = this.properties.findIndex(option => option.propertyId === selected.option.value);
    this.selectedProperty = this.properties[index];

    this.propertyControl.reset();
    this.clientReviewForm.markAsDirty();
  }

  removeSelectedProperty(id: number) {
    this.selectedProperty = new Property();
    this.clientReviewForm.markAsDirty();
  }
  updateStatus(status) {}
  cancel() {
    this.clientReviewForm.reset(this.defaultValues);
  }

  editReview(item) {
    this._router.navigateByUrl("/postreview/update/" + item.reviewId);
  }

  deleteReview(item) {
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
            item.active = false;
            return this._adminService.deleteReview(item.reviewId.toString());
          }
          return;
        })
      )
      .subscribe(response => {
        this._snackbarService.success("Client Review deleted successfully", SnackbarType.Success);
      });
  }

  search() {
    if (!this.clientReviewForm.valid) {
      this._snackbarService.error("Please fix the errors");
      return;
    }
    var options = {
      maxId: 0,
      count: 100,
      includeItems: true,
      status: -1,
      propertyId: 0,
      sortBy: "",
      pageIndex: 1
    };
    //options.maxId = this.data && this.data.paging && this.data.paging.maxId ? this.data.paging.maxId : 0;
    options.count = this.data && this.paginator && this.paginator.pageSize ? this.paginator.pageSize : 100;
    options.pageIndex = this.data && this.paginator && this.paginator.pageIndex ? this.paginator.pageIndex : 0;
    options.status = this.clientReviewForm.get("status").value ? this.clientReviewForm.get("status").value : 0;
    options.propertyId =
      this.selectedProperty && this.selectedProperty.propertyId ? this.selectedProperty.propertyId : 0;
    options.sortBy = this.sort && this.sort.direction ? this.sort.active + "-" + this.sort.direction : "";

    this._adminService.getClientReview(options).subscribe(response => {
      if (response instanceof HttpErrorResponse) {
        this._snackbarService.error("Unable to get client reviews");
        response = {
          data: [],
          paging: { maxId: 0, pageIndex: 0, batchSize: 100, recordCount: 0 }
        };
      } else {
        response = response
          ? response
          : {
              data: [],
              paging: { maxId: 0, pageIndex: 0, batchSize: 100, recordCount: 0 }
            };
      }
      this.refreshClientReview(response);
    });
  }

  // End of public methods
}

@Injectable()
export class ManageClientReviewsResolver implements Resolve<any> {
  constructor(private _adminService: AdminService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this._adminService.getClientReview({
      maxId: 0,
      count: 100,
      includeItems: true
    });
  }
}
