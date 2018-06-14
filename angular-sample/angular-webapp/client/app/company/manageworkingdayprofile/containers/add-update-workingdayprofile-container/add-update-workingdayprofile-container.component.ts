import { Store } from '@ngrx/store';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { TranslationService, LocaleService } from 'angular-l10n';
import { BaseComponent } from './../../../../shared/base-component';
import {
  Component
  , OnInit
  , ChangeDetectionStrategy
  , OnDestroy
  , ChangeDetectorRef
  , ViewEncapsulation
} from '@angular/core';
import { IBreadcrumb } from '../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { Subscription } from 'rxjs/Subscription';
import { EmployeeSettings } from '../../../../shared/models/company.models';
import { isNullOrUndefined } from 'util';
import { CountryLoadAction } from '../../../../shared/actions/lookup.actions';
import { LoadEmployeeSettingsAction } from '../../../../shared/actions/company.actions';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LoadCompanyNonWorkingDaysAction
  , LoadSelectedNonWorkingDaysProfileAction,
  LoadNonWorkingDayProfileAction,
  LoadCustomNonWorkingProfileValidationDataAction
} from '../../../nonworkingdaysandbankholidays/actions/nonworkingdays-actions';
import { Observable } from 'rxjs/Observable';
import { OperationModes } from '../../../../holiday-absence/models/holiday-absence.model';
import { NonWorkingdaysModel } from '../../../nonworkingdaysandbankholidays/models/nonworkingdays-model';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';

@Component({
  selector: 'add-update-workingdayprofile-container',
  templateUrl: './add-update-workingdayprofile-container.component.html',
  styleUrls: ['./add-update-workingdayprofile-container.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddUpdateWorkingdayprofileContainerComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _countries$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _employeeSettings: EmployeeSettings;
  private _workingDayProfileId: string;
  private _operationMode: OperationModes = OperationModes.Add;

  private _employeeSettingSubscription: Subscription;
  private _countrySubscription: Subscription;
  private _routeParamSubscription: Subscription;
  private _profileKeyValuePairSubscription: Subscription;
  private _pageType: string = 'Add';

  // End of Private Fields

  // Public properties
  get operationMode() {
    return this._operationMode;
  }
  get pageType() {
    return this._pageType;
  }

  get countries$() {
    return this._countries$;
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.NonWorkingDays;
  }
  // End of Public properties

  // Public Output bindings

  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService
    , _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
    , private _route: ActivatedRoute
    , private _router: Router
    , private _breadcrumbService: BreadcrumbService
  ) {
    super(_localeService, _translationService, _changeDetector);
  }
  // End of constructor

  // Private methods

  // End of private methods

  // Public methods
  ngOnInit() {
    this._countries$ = this._store.let(fromRoot.getCountryImmutableData);

    this._routeParamSubscription = this._route.params.subscribe(params => {
      if (params['id']) {
        this._operationMode = OperationModes.Update;
        this._workingDayProfileId = params['id'];
        let nonWorkingDay = new NonWorkingdaysModel();
        nonWorkingDay.Id = this._workingDayProfileId;
        nonWorkingDay.IsExample = false;
        this._store.dispatch(new LoadNonWorkingDayProfileAction(nonWorkingDay));
        this._pageType = 'Update';
        let bcItemOne = new IBreadcrumb('Update', `/company/non-working-days-and-bank-holiday/update/${params['type']}/${params['id']}`, BreadcrumbGroup.NonWorkingDays);
        this._breadcrumbService.clear(BreadcrumbGroup.NonWorkingDays);
        this._breadcrumbService.add(bcItemOne);
        this._cdRef.markForCheck();
      } else {
        let bcItemOne = new IBreadcrumb('Add', `/company/non-working-days-and-bank-holiday/add/${params['type']}`, BreadcrumbGroup.NonWorkingDays);
        this._breadcrumbService.clear(BreadcrumbGroup.NonWorkingDays);
        this._breadcrumbService.add(bcItemOne);
        this._cdRef.markForCheck();
      }
    });

    this._countrySubscription = this._store.let(fromRoot.getCountryData).subscribe((countries) => {
      if (isNullOrUndefined(countries)) {
        this._store.dispatch(new CountryLoadAction(true));
      }
    });

    this._employeeSettingSubscription = this._store.let(fromRoot.getEmployeeSettingsData).subscribe((empSettings) => {
      if (isNullOrUndefined(empSettings)) {
        this._store.dispatch(new LoadEmployeeSettingsAction(true));
      } else {
        this._employeeSettings = empSettings;
        this._cdRef.markForCheck();
      }
    });

    this._profileKeyValuePairSubscription = this._store.let(fromRoot.getCustonNonWorkingDaysValidationData)
      .subscribe((profileNames) => {
        if (isNullOrUndefined(profileNames)) {
          this._store.dispatch(new LoadCustomNonWorkingProfileValidationDataAction());
        }
      });
  }
  ngOnDestroy() {
    if (!isNullOrUndefined(this._employeeSettingSubscription)) {
      this._employeeSettingSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._countrySubscription)) {
      this._countrySubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._routeParamSubscription)) {
      this._routeParamSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._profileKeyValuePairSubscription)) {
      this._profileKeyValuePairSubscription.unsubscribe();
    }
  }
  // End of public methods

}
