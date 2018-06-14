import { isNullOrUndefined } from 'util';
import { Observable } from 'rxjs/Rx';
import { CalendarEvent } from './../../../atlas-elements/common/models/calendar-models/calendarEvent';
import { DateRangeFilter } from './../../model/calendar-models';
import { AeSelectItem } from './../../../atlas-elements/common/models/ae-select-item';
import { Router } from '@angular/router';
import { BreadcrumbService } from './../../../atlas-elements/common/services/breadcrumb-service';
import { CalendarComponent } from './../../components/calendar/calendar.component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import {
  ActionTypes,
  SearchEmployeesAction,
  SearchEventsAction,
} from '../../actions/calendar.actions';
import { CalendarFilterModel } from '../../../calendar/model/calendar-filter.model';
import { Store } from '@ngrx/store';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as fromRoot from '../../../shared/reducers/index';
import { RouteParams } from "../../../shared/services/route-params";
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { addDays, addMonths, addWeeks, subDays, subMonths, subWeeks } from 'date-fns';
import { BaseComponent } from '../../../shared/base-component';
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: 'employee-calendar',
  templateUrl: './employee-calendar.component.html',
  styleUrls: ['./employee-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeCalendarComponent extends BaseComponent implements OnInit, OnDestroy {
  private _empCalendarFilterModel: CalendarFilterModel;
  private _empCalendarFilterForm: FormGroup;
  switchTextRight: AeClassStyle = AeClassStyle.TextRight;
  private _events: CalendarEvent[];
  private _eventsSubscription: Subscription;
  private _empPersonalSub: Subscription;
  private _loadStatus: Observable<boolean>;
  private _calendarTitle: string;
  get calendarTitle(): string {
    return this._calendarTitle;
  }
  get loadStatus() {
    return this._loadStatus;
  }
  get events() {
    return this._events;
  }

  get empCalendarFilterForm() {
    return this._empCalendarFilterForm;
  }

  // constructor
  constructor(
    protected _changeDetector: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , protected _localeService: LocaleService
    , private _fb: FormBuilder
    , protected _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , protected _routeParams: RouteParams
    , protected _router: Router
    , private _breadcrumbService: BreadcrumbService) {
    super(_localeService, _translationService, _changeDetector);
    this._initEmployeeCalendarForm();
  }


  /*
  * Method to set the form data
  */
  private _initEmployeeCalendarForm() {
    this._empCalendarFilterModel = new CalendarFilterModel();
    this._empCalendarFilterModel.ExcludeLeavers = false;
    this._empCalendarFilterForm = this._fb.group({
      ShowPending: [{ value: this._empCalendarFilterModel.ShowPending, disabled: false }]
    });
    this._empCalendarFilterModel.Department = [];
    this._empCalendarFilterModel.Site = [];
    this._empPersonalSub = this._store.let(fromRoot.getEmployeePersonalData)
      .subscribe((val) => {
        if (val) {
          let empItem: AeSelectItem<string> = new AeSelectItem<string>();
          let employees: AeSelectItem<string>[] = [];
          empItem.Value = val.Id
          empItem.Text = val.FullName
          this._calendarTitle = val.FullName + '\'s' + ' calendar';
          empItem.Childrens = null;
          empItem.Disabled = false;
          employees.push(empItem);
          this._empCalendarFilterModel.Employee = employees;
          this.dateChanged(new Date());
          this._store.dispatch(new SearchEventsAction(this._empCalendarFilterModel));
        }
      });

  }
  public SwichPending(showPending: boolean) {
    this._empCalendarFilterModel.ShowPending = showPending;
    this._store.dispatch(new SearchEventsAction(this._empCalendarFilterModel));
  }
  public dateChanged(eventDate: Date) {
    /**
    The event fetching logic has been taken from Atlas 1.x.
    Currently it's fetching prior 1 month and after 2 months events against current date.

    However we identified data inconsistency when event dates not fall under this duration but still be on that month.
    So we are now fixing this by considering fetching events from starting of the month to ending instead on considering particular date.

    Eg : Earlier ( current date : August 16 - It fetches data from july 16 2017 to october 16 2017)
    due to that we are loosing few events in respective months
    Now (current date : August 16 - It will fetch events from july 01 2017 to october 31 2017)
    **/

    let startDate = new Date(eventDate);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0);
    startDate = new Date(startDate.getTime() - (7 * 24 * 60 * 60 * 1000));

    let endDate = new Date(eventDate);
    let lastDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
    endDate.setDate(lastDate);
    endDate.setHours(0, 0, 0);
    endDate = new Date(endDate.getTime() + (7 * 24 * 60 * 60 * 1000));

    let dateRange: DateRangeFilter = new DateRangeFilter();
    const subFn: any = {
      day: subDays,
      week: subWeeks,
      month: subMonths
    }['month'];
    const addFn: any = {
      day: addDays,
      week: addWeeks,
      month: addMonths
    }['month'];
    dateRange.start = subFn(startDate, 1);
    dateRange.end = addFn(endDate, 2);
    if (isNullOrUndefined(this._empCalendarFilterModel.dateRange)) {
      this._empCalendarFilterModel.dateRange = dateRange;
    }
    else if (!isNullOrUndefined(this._empCalendarFilterModel.dateRange) && !isNullOrUndefined(dateRange)
      && !(eventDate >= this._empCalendarFilterModel.dateRange.start
        && eventDate <= this._empCalendarFilterModel.dateRange.end)) {
      this._empCalendarFilterModel.dateRange = dateRange;
      this._store.dispatch(new SearchEventsAction(this._empCalendarFilterModel));
    }

  }
  ngOnInit(): void {
    this._eventsSubscription = this._store.let(fromRoot.getCalendarEventsData).subscribe(events => {
      if (!isNullOrUndefined(events) && events.length > 0) {
        this._events = events;
        this._changeDetector.markForCheck();
      }
    });
    this._loadStatus = this._store.select(p => !p.calendarState.calendarStatus)
  }
  ngOnDestroy(): void {
    if (this._eventsSubscription) {
      this._eventsSubscription.unsubscribe();
    }
    if (this._empPersonalSub) {
      this._empPersonalSub.unsubscribe();
    }
  }

}
