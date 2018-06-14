import { PagingInfo } from './../../atlas-elements/common/models/ae-paging-info';
import { LoadNotificationUnReadCountAction, LoadNotificationItemsAction } from './../../root-module/actions/notification-actions';
import { AeLabelStyle } from '../../atlas-elements/common/ae-label-style.enum';
import { Orientation } from '../../atlas-elements/common/orientation.enum';
import { StringHelper } from './../../shared/helpers/string-helper';
import { isNullOrUndefined } from 'util';
import { ClaimsHelperService } from './../../shared/helpers/claims-helper';
import { Observable } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import { BaseComponent } from '../../shared/base-component';
import { Collator, LocaleService, Localization, Translation, TranslationService } from 'angular-l10n';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent extends BaseComponent implements OnInit {
  private _hasEmployeeRecord: boolean = false;
  private _initialFetchCount: number = 999;
  // Private Fields
  // End of Private Fields

  // Public properties
  get HasEmployeeRecord(): boolean {
    return this._hasEmployeeRecord;
  }
  set HasEmployeeRecord(value: boolean) {
    this._hasEmployeeRecord = value;
  }

  aelStyle: AeLabelStyle = AeLabelStyle.Medium;
  imgOrientation: Orientation = Orientation.Horizontal;
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(_localeService: LocaleService, _translationService: TranslationService,
    _cdRef: ChangeDetectorRef, private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  // Private methods
  noEmployeeRecordMessage(): string {
    return this._translationService.translate('NO_EMPLOYEE_RECORD_MSG');
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this._hasEmployeeRecord = !StringHelper.isNullOrUndefinedOrEmpty(this._claimsHelper.getEmpId());
    this._store.dispatch(new LoadNotificationUnReadCountAction());
    this._store.dispatch(new LoadNotificationItemsAction(new PagingInfo(0, 0, 1, this._initialFetchCount)));
  }
  // End of public methods


}
