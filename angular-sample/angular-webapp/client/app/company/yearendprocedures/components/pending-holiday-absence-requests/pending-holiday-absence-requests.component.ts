import {
  Component
  , OnInit
  , ChangeDetectorRef
  , OnDestroy
  , ChangeDetectionStrategy
  , ViewEncapsulation
  , Input
  , ViewChild
  , Output
  , EventEmitter
} from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { BaseComponent } from './../../../../shared/base-component';
import { AeClassStyle } from './../../../../atlas-elements/common/ae-class-style.enum';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { AeIconSize } from './../../../../atlas-elements/common/ae-icon-size.enum';
import { Observable, Subject, Subscription, BehaviorSubject } from 'rxjs/Rx';
import { MyAbsence } from './../../../../holiday-absence/models/holiday-absence.model';
import { DataTableOptions } from './../../../../atlas-elements/common/models/ae-datatable-options';
import { AeDataTableAction } from './../../../../atlas-elements/common/models/ae-data-table-action';
import { AeTemplateComponent } from './../../../../atlas-elements/ae-template/ae-template.component';
import { isNullOrUndefined } from 'util';
import { EmployeeSettings } from './../../../../shared/models/company.models';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { createPopOverVm } from './../../../../atlas-elements/common/models/popover-vm';
import { LoadHolidayAbsenceRequestsAction } from './../../actions/yearendprocedure-actions';
import { AeLoaderType } from './../../../../atlas-elements/common/ae-loader-type.enum';

@Component({
  selector: 'pending-holiday-absence-requests',
  templateUrl: './pending-holiday-absence-requests.component.html',
  styleUrls: ['./pending-holiday-absence-requests.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class PendingHolidayAbsenceRequestsComponent extends BaseComponent implements OnInit, OnDestroy {
  // private field declarations start
  private _employeeSettings: EmployeeSettings;
  private _holidayAbsenceRequests$: Observable<Immutable.List<MyAbsence>>;
  private _recordsCount$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _holidayAbsencesLoading$: Observable<boolean>;
  private _holidayAbsenceRequest: AtlasApiRequestWithParams;
  private _keys = Immutable.List(['Id', 'EmployeeId', 'EmployeeName', 'DepartmentId', 'DepartmentName', 'StartDate',
    'EndDate', 'CreatedOn', 'HolidayUnitType', 'NoOfUnits', 'Reason', 'Comment', 'StatusId', 'ApprovedByName', 'HalfDayType',
    'TypeId', 'Status', 'IsHour', 'NoOfUnitsInFraction', 'NeedToShowAbsencesInPopOver']);
  private _actions: Immutable.List<AeDataTableAction>;
  private _approveHolidayAbsenceRequestCommand = new Subject();
  private _declineHolidayAbsenceRequestCommand = new Subject();
  private _viewHolidayAbsenceRequestRosterCommand = new Subject();
  private _viewHolidayAbsenceRequestTeamCalendarCommand = new Subject();
  private _holidayUnitsPopOverSub: Subscription;

  private _approveCommandSubscription: Subscription;
  private _declineCommandSubscription: Subscription;
  private _viewRosterCommandSubscription: Subscription;
  private _viewTeamCalendarCommandSubscription: Subscription;
  private _holidayAbsenceRequestSubScription: Subscription;
  private _onDemandDataLoad: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private _context: any;

  private _managerCommentLabel: string;
  private _employeeCommentLabel: string;
  private _loadingPendingRequests: boolean;
  private _translationChangedSub: Subscription;
  // end of private fields

  // getters start
  public get bigIconSize() {
    return AeIconSize.big;
  }
  public get holidayAbsenceRequests$() {
    return this._holidayAbsenceRequests$;
  }
  public get recordsCount$() {
    return this._recordsCount$;
  }
  public get dataTableOptions$() {
    return this._dataTableOptions$;
  }
  public get holidayAbsencesLoading$() {
    return this._holidayAbsencesLoading$;
  }
  public get actions() {
    return this._actions;
  }
  public get keys() {
    return this._keys;
  }
  public get iconMedium() {
    return AeIconSize.medium;
  }

  public get loaderType() {
    return AeLoaderType.Bars;
  }
  // end of getters

  // public field declarations start
  @Input('employeeSettings')
  public set employeeSettings(val: EmployeeSettings) {
    this._employeeSettings = val;
  }
  public get employeeSettings() {
    return this._employeeSettings;
  }
  

  @Input('context')
  public get context() {
    return this._context;
  }
  public set context(val: any) {
    this._context = val;
  }

  @Input('loading')
  public get loadingPendingRequests() {
    return this._loadingPendingRequests;
  }
  public set loadingPendingRequests(val: boolean) {
    this._loadingPendingRequests = StringHelper.coerceBooleanProperty(val);
  }
  // end of public field declarations

  // Public Output bindings
  @Output()
  declineRequest: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  approveRequest: EventEmitter<MyAbsence> = new EventEmitter<MyAbsence>();

  @Output()
  viewTeamCalendarRequest: EventEmitter<MyAbsence> = new EventEmitter<MyAbsence>();

  @Output()
  selectTeamRoaster: EventEmitter<MyAbsence> = new EventEmitter<MyAbsence>();

  @Output()
  continueEvent: EventEmitter<any> = new EventEmitter<any>();
  // End of Public Output bindings

  // Public ViewChild bindings
  @ViewChild('popOverTemplate')
  _popOverTemplate: AeTemplateComponent<any>;
  // End of Public ViewChild bindings

  // constrcutor starts
  constructor(protected _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService
    , _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>) {
    super(_localeService, _translationService, _changeDetector);
    this._loadingPendingRequests = false;
    // Action buttons
    this._actions = Immutable.List([
      new AeDataTableAction('Approve', this._approveHolidayAbsenceRequestCommand, false),
      new AeDataTableAction('Decline', this._declineHolidayAbsenceRequestCommand, false),
      new AeDataTableAction('View Roster', this._viewHolidayAbsenceRequestRosterCommand, false),
      new AeDataTableAction('View Team Calendar', this._viewHolidayAbsenceRequestTeamCalendarCommand, false)
    ]);
    // End of action buittons
  }
  // end of constructor

  // private methods start
  private _doAllTranslations() {
    this._managerCommentLabel = this._translationService.translate('Manager_comment');
    this._employeeCommentLabel = this._translationService.translate('Employee_comment');
  }
  // end of private methods

  // public methods

  public getLunchDuration(lunchDuration: number) {
    return Number(Math.round(lunchDuration * 100) / 100).toFixed(2)
  }

  public getPopOverVm(rowContext: any) {
    let newContextObject: any;
    this._holidayUnitsPopOverSub = this._holidayAbsenceRequests$
      .map(x => x.find(x => x.Id === rowContext.Id))
      .subscribe(myHoliday => newContextObject = myHoliday);
    return createPopOverVm<any>(this._popOverTemplate, newContextObject);
  }

  public nextToPendingReuests() {
    this.continueEvent.emit(this._context);
  }

  public getComment(contextObj: MyAbsence): string {
    return this._employeeCommentLabel + ':' + (StringHelper.isNullOrUndefinedOrEmpty(contextObj.Reason) ? 'N/A' : contextObj.Reason) + ' ' + this._managerCommentLabel + ' :' + (StringHelper.isNullOrUndefinedOrEmpty(contextObj.Comment) ? 'N/A' : contextObj.Comment);
  }

  public onSort($event) {
    // this._holidayAbsenceRequest has the current state of request object.
    this._holidayAbsenceRequest.SortBy.SortField = $event.SortField;
    this._holidayAbsenceRequest.SortBy.Direction = $event.Direction;
    this._holidayAbsenceRequest.PageNumber = 1;
    this._store.dispatch(new LoadHolidayAbsenceRequestsAction(this._holidayAbsenceRequest));
  }

  public onPageChange($event) {
    // this._holidayAbsenceRequest has the current state of request object.
    this._holidayAbsenceRequest.PageNumber = $event.pageNumber;
    this._holidayAbsenceRequest.PageSize = $event.noOfRows;
    this._store.dispatch(new LoadHolidayAbsenceRequestsAction(this._holidayAbsenceRequest));
  }

  ngOnInit() {
    this._doAllTranslations();
    this._translationChangedSub = this._translationService.translationChanged.subscribe(
      () => {
        this._doAllTranslations();
      }
    );

    this._declineCommandSubscription = this._declineHolidayAbsenceRequestCommand.subscribe((item: MyAbsence) => {
      this.declineRequest.emit(item.Id);
    });

    this._approveCommandSubscription = this._approveHolidayAbsenceRequestCommand.subscribe((item: MyAbsence) => {
      this.approveRequest.emit(item);
    });

    this._viewTeamCalendarCommandSubscription = this._viewHolidayAbsenceRequestTeamCalendarCommand.subscribe((item: MyAbsence) => {
      this.viewTeamCalendarRequest.emit(item);
    });
    this._viewRosterCommandSubscription = this._viewHolidayAbsenceRequestRosterCommand.subscribe((item: MyAbsence) => {
      this.selectTeamRoaster.emit(item);
    });

    this._holidayAbsenceRequests$ = this._store.let(fromRoot.getPendingHolidayAbsenceRequestsData);
    this._recordsCount$ = this._store.let(fromRoot.getPendingRequestsTotalCountData);
    this._dataTableOptions$ = this._store.let(fromRoot.getPendingRequestsDataTableOptionsData);
    this._holidayAbsencesLoading$ = this._store.let(fromRoot.getPendingRequestsLoadedState);

    this._store.let(fromRoot.getPendingRequestsApiRequestData)
      .takeUntil(this._destructor$)
      .subscribe(c => {
        if (!isNullOrUndefined(c)) {
          this._holidayAbsenceRequest = c;
        }
      });
  }

  ngOnDestroy() {
    if (this._translationChangedSub) {
      this._translationChangedSub.unsubscribe();
    }
    if (!isNullOrUndefined(this._declineCommandSubscription)) {
      this._declineCommandSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._approveCommandSubscription)) {
      this._approveCommandSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._viewTeamCalendarCommandSubscription)) {
      this._viewTeamCalendarCommandSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._viewRosterCommandSubscription)) {
      this._viewRosterCommandSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._holidayAbsenceRequestSubScription)) {
      this._holidayAbsenceRequestSubScription.unsubscribe();
    }
    super.ngOnDestroy();
  }
  // end of public methods
}
