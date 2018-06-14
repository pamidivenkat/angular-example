import { BaseElementGeneric } from '../common/base-element-generic';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { CalendarEvent } from '../common/models/calendar-models/calendarEvent';
import { DayVM } from '../common/models/calendar-models/dayView';
import * as startOfToday from 'date-fns/start_of_today';
import * as subWeeks from 'date-fns/sub_weeks';
import * as subMonths from 'date-fns/sub_months';
import * as addWeeks from 'date-fns/add_weeks';
import * as addMonths from 'date-fns/add_months';
import * as addDays from 'date-fns/add_days';
import * as subDays from 'date-fns/sub_days';
import * as getISOWeek from 'date-fns/get_iso_week';
import * as isSameDay from 'date-fns/is_same_day';
import { AeLoaderType } from '../common/ae-loader-type.enum';
import { AeClassStyle } from '../common/ae-class-style.enum';

@Component({
  selector: 'ae-fullcalendar',
  templateUrl: './ae-fullcalendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./ae-fullcalendar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AeFullcalendarComponent extends BaseElementGeneric<Date> implements OnInit {

  // private fields

  private _view: string;
  private _viewDate: Date;
  private _events: CalendarEvent[];
  private _calendarTitle: string;
  private _loading: boolean;
  private _loaderBars: AeLoaderType = AeLoaderType.Bars;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  // End of private fields

  // public input bindings
  
  get loaderBars(): AeLoaderType{
    return this._loaderBars;
  }

   get lightClass(): AeClassStyle {
        return this._lightClass;
    }

  /**
 * view type day , week or year
 */
  @Input('calendarTitle')
  get calendarTitle() {
    return this._calendarTitle;
  }
  set calendarTitle(value: string) {
    this._calendarTitle = value;
  }

  @Input('loading')
  get loading() {
    return this._loading;
  }
  set loading(val: boolean) {
    this._loading = val;
  }



  /**
  * view type day , week or year
  */
  @Input('view')
  get view() {
    return this._view;
  }

  set view(value: string) {
    this._view = value;
  }

  /**
  * view date , current selected date
  */
  @Input('viewDate')
  get viewDate() {
    return this._viewDate;
  }

  set viewDate(value: Date) {
    this._viewDate = value;
  }
  /**
  * input events data to display in calendar
  */

  @Input('events')
  get events() {
    return this._events;
  }

  set events(value: CalendarEvent[]) {
    this._events = value;
  }

  // End of public input bindings

  // public output bindings

  @Output() viewChange: EventEmitter<string> = new EventEmitter();

  @Output() viewDateChange: EventEmitter<Date> = new EventEmitter();

  // End of public output bindings

  // public fields
  weekTitle: string;
  isToday: boolean;

  // end of public fields

  // Constructor
  constructor(public cdr: ChangeDetectorRef) {
    super(cdr);
  }
  // End of Constructor

  ngOnInit() {
    this.view = 'month';
    this.viewDate = new Date();
    this._checkIsToday();
  }


  // methods

  /**
  * Previous button click event in calendar header to move between calendar data.
  */
  onPrvClick(event: any) {
    const subFn: any = {
      day: subDays,
      week: subWeeks,
      month: subMonths
    }[this.view];

    this.viewDate = subFn(this.viewDate, 1);
    this._weekViewTitle(this.viewDate);
    this._checkIsToday();
    this.viewDateChange.emit(this.viewDate);
  }

  /**
 *  Next button click event in calendar header to move between calendar data.
 */
  onNextClick(event: any) {
    const addFn: any = {
      day: addDays,
      week: addWeeks,
      month: addMonths
    }[this.view];

    this.viewDate = addFn(this.viewDate, 1);
    this._weekViewTitle(this.viewDate);
    this._checkIsToday();
    this.viewDateChange.emit(this.viewDate);
  }

  /**
  * Today button click event in calendar header to display today calendar data.
  */
  onTodayClick(event: any) {
    this.viewDate = startOfToday();
    this._weekViewTitle(this.viewDate);
    this._checkIsToday();
    this.viewDateChange.emit(this.viewDate);
  }

  /**
  * Month button click event in calendar header to display today calendar data.
  */
  onMonthViewClick(event: any) {
    this.view = 'month';
  }

  /**
  * Week button click event in calendar header to display today calendar data.
  */
  onWeekViewClick(event: any) {
    this.view = 'week';
    this._weekViewTitle(this.viewDate);
  }

  /**
  * Day button click event in calendar header to display today calendar data.
  */
  onDayViewClick(event: any) {
    this.view = 'day';
  }

  _weekViewTitle(date: Date): void {
    const year: number = date.getFullYear();
    const weekNumber: number = getISOWeek(date);
    this.weekTitle = `Week ${weekNumber} of ${year}`;
  }

  private _checkIsToday() {
    if (isSameDay(this.viewDate, new Date())) {
      this.isToday = true;
    }
    else {
      this.isToday = false;
    }
  }
  legendOptions = [{ Text: "Absence", Class: "absence-color" }, { Text: "Holiday", Class: "holiday-color" }, { Text: "Public Holiday", Class: "public-holiday-color" }, { Text: "Current Day", Class: "current-day-color" }, { Text: "Pending Holiday", Class: "pending-holiday-color" }];
  // End of  methods

}
