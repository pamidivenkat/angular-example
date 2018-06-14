import { isNullOrUndefined } from 'util';
import { AuditLog } from '../../models/audit-log.model';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, Input } from '@angular/core';
import { BaseComponent } from '../../../../shared/base-component';
import { LocaleService, TranslationService, LocaleDatePipe } from 'angular-l10n';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../../shared/reducers/index';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import { LoadAuditLogDataAction, LoadAuditLogVersionDataAction } from '../../actions/user.actions';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../../shared/models/atlas-api-response';
import { AePageChangeEventModel } from '../../../../atlas-elements/common/models/ae-page-change-event-model';
import { FormGroup, FormBuilder } from "@angular/forms";
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import * as Immutable from 'immutable';
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import { User } from "../../models/user.model";

@Component({
  selector: 'audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AuditLogComponent extends BaseComponent implements OnInit, OnDestroy {
  private _canShowAuditLog: boolean = false;
  private _auditLogData$: BehaviorSubject<Immutable.List<AuditLog>>;
  private _auditLogDataSubscription$: Subscription;
  private _auditLogFormChangeSubscription$: Subscription;
  private _auditLogApiRequestParams: AtlasApiRequestWithParams;
  private _selectedUser: User;
  private _auditLogForm: FormGroup;
  private _defaultLocale: string;
  private _totalCount$: Observable<number>;
  private _auditLogDataTableOptions$: Observable<DataTableOptions>;
  private _auditLogDataLoading$: Observable<boolean>;
  private _actions: Immutable.List<AeDataTableAction>;
  private _viewActionCommand = new Subject();
  private _viewActionCommandSubscription$: Subscription;
  private _logDetailsSlideOut: boolean = false;
  private _selectedAuditLog: AuditLog;
  private _keys = ['Id', 'ModifiedBy', 'ValidFrom', 'Version', 'IsDeleted'];

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _fb: FormBuilder
    , private _localeDatePipe: LocaleDatePipe
  ) {
    super(_localeService, _translationService, _cdRef);
  }

  @Input('loggedInUser')
  set loggedInUser(value: User) {
    this._selectedUser = value;
  }
  get loggedInUser() {
    return this._selectedUser;
  }
  

  get canShowAuditLog(): boolean {
    return this._canShowAuditLog;
  }

  get auditLogForm(): FormGroup {
    return this._auditLogForm;
  }

  get auditLogData$(): BehaviorSubject<Immutable.List<AuditLog>> {
    return this._auditLogData$;
  }

  get totalCount$(): Observable<number> {
    return this._totalCount$;
  }

  get auditLogDataTableOptions$(): Observable<DataTableOptions> {
    return this._auditLogDataTableOptions$;
  }

  get auditLogDataLoading$(): Observable<boolean> {
    return this._auditLogDataLoading$;
  }

  get keys() {
    return this._keys;
  }

  get actions() {
    return this._actions;
  }

  get logDetailsSlideOut(): boolean {
    return this._logDetailsSlideOut;
  }

  get selectedAuditLog(): AuditLog {
    return this._selectedAuditLog;
  }

  ngOnInit() {
    this._defaultLocale = this._localeService.getDefaultLocale();
    let startDate = this.addDaysToDate(new Date(), -7);
    let endDate = this.addDaysToDate(new Date(), 1);
    endDate.setHours(23, 59, 59);
    this._auditLogForm = this._fb.group({
      startDate: [{ value: startDate, disabled: false }, null],
      endDate: [{ value: endDate, disabled: false }, null]
    });

    this._auditLogData$ = new BehaviorSubject(Immutable.List([]));
    this._auditLogDataSubscription$ = this._store.let(fromRoot.getAuditLogData).subscribe(res => {
      if (!isNullOrUndefined(res)) {
        res.map(obj => {
          obj.IsDeleted = this._selectedUser.IsDeleted;
        })
        this._auditLogData$.next(Immutable.List<AuditLog>(res));
      }
    });

    this._actions = Immutable.List([
      new AeDataTableAction("View", this._viewActionCommand, false),
    ]);

    this._viewActionCommandSubscription$ = this._viewActionCommand.subscribe(res => {
      let log = res as AuditLog;
      this._selectedAuditLog = log;
      this._store.dispatch(new LoadAuditLogVersionDataAction({ id: this._selectedUser && this._selectedUser.Id, versionDate: log.ValidFrom }));
      this._logDetailsSlideOut = true;
    })

    this._totalCount$ = this._store.let(fromRoot.getAuditLogDataLength);
    this._auditLogDataTableOptions$ = this._store.let(fromRoot.getAuditLogDataPageInformation);
    this._auditLogDataLoading$ = this._store.let(fromRoot.getAuditLogDataLoadingStatus);

    this._auditLogFormChangeSubscription$ = this._auditLogForm.valueChanges.subscribe(data => {
      if (!this.fieldHasDateComparisonError()) {
        this.loadAuditLogData(0, 0);
      }
    })
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._viewActionCommandSubscription$)) {
      this._viewActionCommandSubscription$.unsubscribe();
    }
    if (!isNullOrUndefined(this._auditLogDataSubscription$)) {
      this._auditLogDataSubscription$.unsubscribe();
    }
    if (!isNullOrUndefined(this._auditLogFormChangeSubscription$)) {
      this._auditLogFormChangeSubscription$.unsubscribe();
    }
    super.ngOnDestroy();
  }

  public fieldHasDateComparisonError(): boolean {
    let startDate = new Date(this._auditLogForm.get('startDate').value);
    let endDate = new Date(this._auditLogForm.get('endDate').value);
    return startDate > endDate;
  }

  private loadAuditLogData(pageNumber: number, pageSize: number) {
    let startDate = this._localeDatePipe.transform(this._auditLogForm.get('startDate').value, this._defaultLocale, 'MM/dd/yyyy');
    let endDate = this._localeDatePipe.transform(this._auditLogForm.get('endDate').value, this._defaultLocale, 'MM/dd/yyyy');
    if (isNullOrUndefined(this._auditLogApiRequestParams))
      this._auditLogApiRequestParams = <AtlasApiRequestWithParams>{};
    this._auditLogApiRequestParams.PageNumber = pageNumber;
    this._auditLogApiRequestParams.PageSize = pageSize;
    this._auditLogApiRequestParams.Params = [];
    this._auditLogApiRequestParams.Params.push(new AtlasParams('startdate', startDate));
    this._auditLogApiRequestParams.Params.push(new AtlasParams('enddate', endDate));
    this._auditLogApiRequestParams.Params.push(new AtlasParams('id', this._selectedUser && this._selectedUser.Id));
    this._store.dispatch(new LoadAuditLogDataAction(this._auditLogApiRequestParams));
  }

  private addDaysToDate(date, days): Date {
    return date.setTime(864E5 * days + date.valueOf()) && date;
  }

  onPageChange(pagingInfo: AePageChangeEventModel) {
    this.loadAuditLogData(pagingInfo.pageNumber, pagingInfo.noOfRows);
  }

  showAuditLogs() {
    this._canShowAuditLog = !this._canShowAuditLog;
    this.loadAuditLogData(0, 0);
  }

  getSlideoutState(): string {
    return this._logDetailsSlideOut ? 'expanded' : 'collapsed';
  }

  closeSlideOut(e) {
    this._logDetailsSlideOut = false;
  }

}
