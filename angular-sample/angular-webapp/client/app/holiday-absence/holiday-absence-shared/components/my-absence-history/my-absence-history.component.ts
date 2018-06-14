import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Input, OnDestroy } from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { BaseComponent } from '../../../../shared/base-component';
import * as fromRoot from '../../../../shared/reducers';
import { Subscription } from "rxjs/Rx";
import { MyAbsenceHistory } from '../../../models/holiday-absence.model';
import { isNullOrUndefined } from "util";
import { LoadEmployeeAbsenceHistoryAction } from '../../../actions/holiday-absence.actions';
import { StringHelper } from '../../../../shared/helpers/string-helper';
import * as Immutable from 'immutable';

@Component({
  selector: 'my-absence-history',
  templateUrl: './my-absence-history.component.html',
  styleUrls: ['./my-absence-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyAbsenceHistoryComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private field declarations
  private _loadAbsenceHistorySubscription: Subscription;
  private _absenceHistoryList: Immutable.List<MyAbsenceHistory> = Immutable.List([]);
  private _myAbsenceId: string;
  private _isOpen : boolean = false;
  // End of private field declarations

  // Public field declarations
  @Input('myAbsenceId')
  get myAbsenceId() {
    return this._myAbsenceId;
  }
  set myAbsenceId(val: string) {
    this._myAbsenceId = val;
  }
  get absenceHistoryList() {
    return this._absenceHistoryList;
  }

  get isOpen(){
    return this._isOpen;
  }
  // End of public field declarations

  // Output property declarations

  // End of output propery declarations
  // constructor starts
  /**
   * Creates an instance of MyAbsenceHistoryComponent.
   * @param {LocaleService} _localeService
   * @param {TranslationService} _translationService
   * @param {ChangeDetectorRef} _cdRef
   * @param {Store<fromRoot.State>} _store
   * @param {ClaimsHelperService} _claimsHelper
   *
   * @memberOf MyAbsenceHistoryComponent
   */
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  // Private methods

  // End of private methods

  // Public methods
  public toggleHistoryPanel(status) {
    if (status &&
      !StringHelper.isNullOrUndefinedOrEmpty(this.myAbsenceId) &&
      !isNullOrUndefined(this._absenceHistoryList)) {
        this._isOpen = true;
      this._store.dispatch(new LoadEmployeeAbsenceHistoryAction(this.myAbsenceId));
    }else{
      this._isOpen = false;
    }
  }

  ngOnInit() {
    this._loadAbsenceHistorySubscription = this._store.let(fromRoot.getEmployeeAbsenceHistory)
      .subscribe((absenceHistory) => {
        if (!isNullOrUndefined(absenceHistory)) {
          this._absenceHistoryList = absenceHistory;
          this._cdRef.markForCheck();
        }
      });
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._loadAbsenceHistorySubscription)) {
      this._loadAbsenceHistorySubscription.unsubscribe();
    }
  }
  // End of public methods
}
