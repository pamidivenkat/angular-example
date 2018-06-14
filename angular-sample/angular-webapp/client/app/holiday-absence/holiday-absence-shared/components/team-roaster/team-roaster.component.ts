import { AeNav } from '../../../../atlas-elements/common/ae-nav.enum';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AeIconSize } from '../../../../atlas-elements/common/ae-icon-size.enum';
import { MyAbsence, MyAbsenceType } from './../../../models/holiday-absence.model';
import { DataTableOptions } from './../../../../atlas-elements/common/models/ae-datatable-options';
import { DateTimeHelper } from './../../../../shared/helpers/datetime-helper';
import { isNullOrUndefined } from 'util';
import { Observable, Subscription, BehaviorSubject } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  Input,
  EventEmitter,
  Output
} from '@angular/core';
import * as fromRoot from '../../../../shared/reducers/index';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import * as Immutable from 'immutable';
import { TeamRoster } from './../../../models/team-roster.model';
import { WeekModel } from '../../../../shared/models/weekmodel';

@Component({
  selector: 'team-roaster',
  templateUrl: './team-roaster.component.html',
  styleUrls: ['./team-roaster.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamRoasterComponent extends BaseComponent implements OnInit {

  //private properties
  private _departmentName: string;
  private _departmentId: string;
  private _loading$: Observable<boolean>;
  private _recordsCount$: Observable<number>;
  private _data$: Observable<Immutable.List<TeamRoster>>;
  private _weekModel: WeekModel;
  private _selectedDate: Date = new Date();
  private _keys = Immutable.List(['EmployeeId', 'Name', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'NonWorkingDays']);
  private _dataTableOptions: DataTableOptions;
  private _iconOneSize: AeIconSize = AeIconSize.small;
  private _holidayRosterForm: FormGroup;
  private _forward: AeNav = AeNav.Forward;
  private _backward: AeNav = AeNav.Backward;
  //end of private properties
  //properties
  get data$(): Observable<Immutable.List<TeamRoster>> {
    return this._data$;
  }
  @Input('initialWeekModel')
  set WeekModel(val: WeekModel) {
    this._weekModel = val;
    if (val) {
      this._selectedDate = val.Date;
    }
  }
  get WeekModel() {
    return this._weekModel;
  }
  


  @Input('DepartmentName')
  get DepartmentName() {
    return this._departmentName;
  }
  set DepartmentName(val: string) {
    this._departmentName = val;
  }

  @Input('DepartmentId')
  get DepartmentId() {
    return this._departmentId;
  }
  set DepartmentId(val: string) {
    this._departmentId = val;
  }

  @Input('loading')
  set Loading(val: Observable<boolean>) {
    this._loading$ = val;
  }
  get Loading() {
    return this._loading$;
  }
 


  @Input('recordsCount')
  get RecordsCount() {
    return this._recordsCount$;
  }
  set RecordsCount(val: Observable<number>) {
    this._recordsCount$ = val;
  }

  @Input('dataTableOptions')
  set DataTableOptions(val: DataTableOptions) {
    this._dataTableOptions = val;
  }
  get DataTableOptions() {
    return this._dataTableOptions;
  }
 

  @Input('rosterData')
  set RosterData(val: Observable<Immutable.List<TeamRoster>>) {
    this._data$ = val;
  }
  get RosterData() {
    return this._data$;
  }
 
  get holidayRosterFrm() {
    return this._holidayRosterForm;
  }
  get keys() {
    return this._keys;
  }
  get iconOneSize() {
    return this._iconOneSize;
  }
  get forward() {
    return this._forward;
  }
  get backward() {
    return this._backward;
  }
  //end of properties
  //private methods

  private _initForm() {
    this._holidayRosterForm = this._fb.group({
      selectedDate: [{ value: this._selectedDate, disabled: false }]
    }
    );
  }

  //end private methods
  // constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _fb: FormBuilder
  ) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  // Public Output bindings
  @Output()
  aeOnClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  aeWeekChange: EventEmitter<WeekModel> = new EventEmitter<WeekModel>();
  //end of public output bindings
  //public methods
  public onPrevious($event) {
    // get the previous week of the current selected week selection
    let sameDateOfPreviousWeek = this._weekModel.Date.setDate(this._weekModel.Date.getDate() - 7);
    this._weekModel = DateTimeHelper.getWeek(this._weekModel.Date);
    this.aeWeekChange.emit(this._weekModel);
  }
  public onNext($event) {
    // get the next week of the current selected week selection
    let sameDateOfNextWeek = this._weekModel.Date.setDate(this._weekModel.Date.getDate() + 7);
    this._weekModel = DateTimeHelper.getWeek(this._weekModel.Date);
    this.aeWeekChange.emit(this._weekModel);
  }
  public onDateChange($event) {
    this._selectedDate = $event;
    this._weekModel = DateTimeHelper.getWeek($event);
    this.aeWeekChange.emit(this._weekModel);
  }
  public getAvailability(item) {
    return "Available";
  }
  public slideClose($event) {
    this.aeOnClose.emit(true);
  }
  public _isNonWorkingDay(dayName: number, nonWorkingDays: number[]) {
    if (nonWorkingDays)
      for (var i = 0; i < nonWorkingDays.length; i++) {
        if (dayName == nonWorkingDays[i])
          return true;
      }
    return false;
  }

  public getImageTitle(dayName: number, nonWorkingDays: number[], obj: MyAbsence) {
    if (this._isNonWorkingDay(dayName, nonWorkingDays))
      return "Non Working Day";
    else {
      if (obj) {
        if (obj.TypeId == MyAbsenceType.Holiday) {
          return "Holiday - " + obj.Status.Name;
        }
        return "Absence - " + obj.Status.Name;
      } else {
        return "Available";
      }
    }
  }
  public getIconName(dayName: number, nonWorkingDays: number[], obj: MyAbsence) {
    let appropriateIcon: string;
    if (this._isNonWorkingDay(dayName, nonWorkingDays))
      appropriateIcon = "";
    else {
      if (obj) {
        appropriateIcon = obj.TypeId == MyAbsenceType.Holiday ? 'icon-case' : 'icon-steth';
      }
      else {
        appropriateIcon = 'icon-alert-circle-tick';
      }
    }
    return appropriateIcon;
  }

  ngOnInit() {
    this._initForm();
  }
  //end of public methods
}
