import { ViewEncapsulation, Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../../shared/reducers';
import * as Immutable from 'immutable';
import { isNullOrUndefined } from 'util';
import { LoadSitesAction } from '../../../../shared/actions/company.actions';
import { Subscription } from 'rxjs/Subscription';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import {
  LoadCompanyDepartmentsAction
  , LoadCompanyEmployeesAction
  , LoadSelectedEmployeeBasicInfoAction,
  ClearSelectedEmployeeBasicInfoCompleteAction
} from '../../actions/manage-departments.actions';
import { DepartmentType } from '../../models/department-type.enum';
import { mapDepartmentsToAeSelectItems } from '../../common/extract-helper';
import { Observable } from 'rxjs/Observable';
import { EmployeeMetadata } from '../../models/employee-metadata.model';
import { IBreadcrumb } from '../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { DepartmentModel } from '../../models/department.model';
import { EmployeeBasicInfoModel } from '../../models/employee-basic-info.model';
import { StringHelper } from '../../../../shared/helpers/string-helper';
import { AtlasApiRequest } from '../../../../shared/models/atlas-api-response';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AeBannerTheme } from '../../../../atlas-elements/common/ae-banner-theme.enum';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
@Component({
  selector: 'manage-departments-container',
  templateUrl: './manage-departments-container.component.html',
  styleUrls: ['./manage-departments-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ManageDepartmentsContainerComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private field declaraions start
  private _sitesSubscription: Subscription;
  private _departmentsSubscription: Subscription;
  private _employeeSubscription: Subscription;
  private _departmentEmployeeSubscription: Subscription;
  private _employeeBasicInfoSubscription: Subscription;

  private _sites: Immutable.List<AeSelectItem<string>>;
  private _departmentOptions: Immutable.List<AeSelectItem<string>>;
  private _employees: Array<EmployeeMetadata>;
  private _departmentEmployees: Map<string, Array<EmployeeMetadata>>;
  private _departments: Array<DepartmentModel>;
  private _employeeBasicInfo: EmployeeBasicInfoModel = new EmployeeBasicInfoModel();
  private _showEmployeeInfoSlideOut: boolean = false;
  private _refreshTrigger: boolean = null;
  aeBannerTheme = AeBannerTheme.Default;
  // End of private field declarations

  get sites() {
    return this._sites;
  }

  get departmentOptions() {
    return this._departmentOptions;
  }

  get departmentEmployees() {
    return this._departmentEmployees;
  }

  get showEmployeeInfoSlideOut() {
    return this._showEmployeeInfoSlideOut;
  }

  get employeeBasicInfo() {
    return this._employeeBasicInfo;
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Company;
  }

  // Constructor
  constructor(protected _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService
    , _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
    , private _breadcrumbService: BreadcrumbService
  ) {
    super(_localeService, _translationService, _changeDetector);

    let bcItem = new IBreadcrumb('Manage departments', '/company/department', BreadcrumbGroup.Company);
    this._breadcrumbService.add(bcItem);
  }
  // End of constructor

  // private methods start
  onEmployeeSelect(employeeId) {
    if (!StringHelper.isNullOrUndefinedOrEmpty(employeeId)) {
      this._store.dispatch(new LoadSelectedEmployeeBasicInfoAction(employeeId));
      this._showEmployeeInfoSlideOut = true;
    }
  }

  getEmployeeInfoSlideoutState() {
    return this._showEmployeeInfoSlideOut ? 'expanded' : 'collapsed';
  }

  onEmployeeInfoCancel(e) {
    this._store.dispatch(new ClearSelectedEmployeeBasicInfoCompleteAction(true));
    this._showEmployeeInfoSlideOut = false;
  }
  // end of private methods

  // public methods start
  ngOnInit() {
    this._sitesSubscription = this._store.let(fromRoot.sitesForClientsImmutableData).subscribe((sites) => {
      if (isNullOrUndefined(sites) || sites.count() <= 0) {
        this._store.dispatch(new LoadSitesAction(false));
      } else {
        this._sites = sites;
        this._cdRef.markForCheck();
      }
    });


    this._departmentsSubscription = this._store.let(fromRoot.getCompanyDepartmentsData).subscribe((departments) => {
      if (isNullOrUndefined(departments)) {
        this._store.dispatch(new LoadCompanyDepartmentsAction(this._claimsHelper.getCompanyIdOrCid()));
      } else {
        this._departments = departments;
        this._departmentOptions = mapDepartmentsToAeSelectItems(departments);
        this._cdRef.markForCheck();
      }
    });

    this._employeeSubscription = Observable.combineLatest(this._store.let(fromRoot.getCompanyDepartmentsData),
      this._store.let(fromRoot.getCompanyEmployeesData)).subscribe((values) => {
        if (!isNullOrUndefined(values[0]) &&
          isNullOrUndefined(values[1])) {
          this._store.dispatch(new LoadCompanyEmployeesAction(true));
        } else {
          this._employees = values[1];
          this._cdRef.markForCheck();
        }
      });

    this._departmentEmployeeSubscription = this._store.let(fromRoot.getCompanyDepartmentEmployeesData).subscribe((deptEmployees) => {
      if (!isNullOrUndefined(deptEmployees)) {
        this._departmentEmployees = deptEmployees;
        this._cdRef.markForCheck();
      }
    });

    this._employeeBasicInfoSubscription = this._store.let(fromRoot.getSelectedEmployeeBasicInfoData).subscribe((data) => {
      if (!isNullOrUndefined(data)) {
        this._employeeBasicInfo = data;
      } else {
        this._employeeBasicInfo = new EmployeeBasicInfoModel();
      }
      this._cdRef.markForCheck();
    });
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._sitesSubscription)) {
      this._sitesSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._departmentsSubscription)) {
      this._departmentsSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._employeeSubscription)) {
      this._employeeSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._departmentEmployeeSubscription)) {
      this._departmentEmployeeSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._employeeBasicInfoSubscription)) {
      this._employeeBasicInfoSubscription.unsubscribe();
    }
  }
  // end of public methods
}
