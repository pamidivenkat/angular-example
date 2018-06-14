import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { TranslationService, LocaleService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { BaseComponent } from './../../../../shared/base-component';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import * as fromRoot from './../../../../shared/reducers/index';
import { Observable, Subscription } from 'rxjs/Rx';
import { EmployeeSettings } from './../../../../shared/models/company.models';
import {
  LoadEmployeeSettingsAction,EmployeeSettingsUpdateAction
} from './../../../../shared/actions/company.actions';

@Component({
  selector: 'holidaysettings-container',
  templateUrl: './holidaysettings-container.component.html',
  styleUrls: ['./holidaysettings-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HolidaysettingsContainerComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _holidaySettingsLoaded$: Observable<boolean>;
  private _holidaySettingsSubscription: Subscription;
  private _holidaySettingsData$: Observable<EmployeeSettings>;
  // End of private Fields

  // Constructor
  constructor(protected _changeDetector: ChangeDetectorRef
    , protected _store: Store<fromRoot.State>
    , _localeService: LocaleService
    , _translationService: TranslationService) {
    super(_localeService, _translationService, _changeDetector);
    
  }
  // End of constructor

  // Private methods
  submitHolidaySettings(holidaySettings: EmployeeSettings) {
    this._store.dispatch(new EmployeeSettingsUpdateAction(holidaySettings));
  }
  // End of private methods

  get holidaySettingsData$(): Observable<EmployeeSettings>{
    return this._holidaySettingsData$;
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.HolidaySettings;
}

  // Public methods
  ngOnInit() {
    this._holidaySettingsLoaded$ = this._store.let(fromRoot.getEmployeeSettingsLoadingState);

    if (this._holidaySettingsLoaded$) {
      this._holidaySettingsData$ = this._store.let(fromRoot.getEmployeeSettingsData);
    }

    this._holidaySettingsSubscription = this._holidaySettingsLoaded$.subscribe(employeeSettingsLoaded => {
      if (!employeeSettingsLoaded)
        this._store.dispatch(new LoadEmployeeSettingsAction(true));
    });

  }
  ngOnDestroy() {
     if (this._holidaySettingsSubscription)
      this._holidaySettingsSubscription.unsubscribe();
  }
  // End of public methods

}
