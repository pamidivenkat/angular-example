import {
  animate,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  LOCALE_ID,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  style,
  transition,
  trigger,
  ViewEncapsulation
} from '@angular/core';
import { CalendarEvent } from '../../common/models/calendar-models/calendarEvent';
import { MonthVM } from '../../common/models/calendar-models/monthView';
import { MonthViewDayVM  } from '../../common/models/calendar-models/monthViewDay';
import { WeekDayVM } from '../../common/models/calendar-models/weekDay';
import {
  getMonthView,
  getDayViewHourGrid,
  getWeekViewHeader,
  getWeekDay
} from '../../common/models/ae-calendar-utils';
import { BaseElementGeneric } from '../../common/base-element-generic';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

import * as isSameDay from 'date-fns/is_same_day';
import * as setDate from 'date-fns/set_date';
import * as setMonth from 'date-fns/set_month';
import * as setYear from 'date-fns/set_year';
import * as getDate from 'date-fns/get_date';
import * as getMonth from 'date-fns/get_month';
import * as getYear from 'date-fns/get_year';
import * as differenceInSeconds from 'date-fns/difference_in_seconds';
import * as addSeconds from 'date-fns/add_seconds';
import * as isSameMonth from 'date-fns/is_same_month';

@Component({
  selector: 'ae-calendar-month-view',
  templateUrl: './ae-calendar-month-view.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./ae-calendar-month-view.component.scss']
})
export class AeCalendarMonthViewComponent extends BaseElementGeneric<Date> implements OnInit {

  // private fields

  private _dayClick: Subject<MonthViewDayVM> = new Subject<MonthViewDayVM>();

  private _viewDate: Date;
  private _selectedDayEventDate: Date;
  private _events: CalendarEvent[];
  private _activeDayIsOpen : boolean;



  // End of private fields

  get dayClick(): Subject<MonthViewDayVM>{
    return this._dayClick;
  }

  constructor(public cdr: ChangeDetectorRef) {

    super(cdr);

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

  /**
   * Whether the events list for the day of the `viewDate` option is visible or not
   */
   @Input('activeDayIsOpen')
  get activeDayIsOpen() {
    return this._activeDayIsOpen;
  }

  set activeDayIsOpen(value: boolean) {
    this._activeDayIsOpen= value;
  }

  /**
   * A function that will be called before each cell is rendered. The first argument will contain the calendar cell.
   * If you add the `cssClass` property to the cell it will add that class to the cell in the template
   */
  @Input() dayModifier: Function;

  /**
   * The start number of the week
   */
  @Input() weekStartsOn: number;

  /**
   * columnHeaders
   */
  columnHeaders: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  /**
   * toDayDate
   */
  toDayDate: Date = new Date(); 

  /**
   * Month view
   */
  view: MonthVM;

  /**
   * openRowIndex
   */
  openRowIndex: number;

  /**
   * openDay
   */
  openDay: MonthViewDayVM ;


  /**
   * Month day
   */
  day: MonthViewDayVM ;

  /**
  * ngOnInit
  */
  ngOnInit(): void {
    this._dayClick.subscribe((dayData) => {
      // set openRowIndex
      if ((isSameDay(this._selectedDayEventDate, dayData.date) && this.activeDayIsOpen === true) || dayData.events.length === 0) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this._selectedDayEventDate = dayData.date;
      }
      this._checkActiveDayIsOpenForClickEvent(dayData.date);
    });
    this._refreshAll();
  }

  /**
   * ngOnChanges
   */
  ngOnChanges(changes: any): void {
    if (changes.viewDate || changes.events) {
      this._refreshBody();
      this.openRowIndex = null;
    }
    if (changes.activeDayIsOpen || changes.viewDate || changes.events) {
      this._checkActiveDayIsOpen();
    }
  }

  /**
   * ngOnDestroy
   */
  ngOnDestroy(): void {
    if (this._dayClick) {
      this._dayClick.unsubscribe();
    }
  }

  /**
  * @refreshBody
  */
  private _refreshBody(): void {
    this.view = getMonthView({
      events: this.events,
      viewDate: this.viewDate,
      weekStartsOn: this.weekStartsOn
    });
    if (this.dayModifier) {
      this.view.days.forEach(day => this.dayModifier(day));
    }
  }


// Private methods

  private _checkActiveDayIsOpen(): void {
    if (this.activeDayIsOpen === true) {
      this.openDay = this.view.days.find(day => isSameDay(day.date, this.viewDate));
      if (this.openDay.events.length > 0) {
        const index: number = this.view.days.indexOf(this.openDay);
        this.openRowIndex = Math.floor(index / 7) * 7;
      }
      else {
        this.openRowIndex = null;
        this.openDay = null;
        this.activeDayIsOpen = false;
      }
    } else {
      this.openRowIndex = null;
      this.openDay = null;
    }
  }

  private _checkActiveDayIsOpenForClickEvent(date :Date): void {
    if (this.activeDayIsOpen === true) {
      this.openDay = this.view.days.find(day => isSameDay(day.date, date));
      if (this.openDay.events.length > 0) {
        const index: number = this.view.days.indexOf(this.openDay);
        this.openRowIndex = Math.floor(index / 7) * 7;
      }
      else {
        this.openRowIndex = null;
        this.openDay = null;
        this.activeDayIsOpen = false;
        this._selectedDayEventDate = null;
      }
    } else {
      this.openRowIndex = null;
      this.openDay = null;
    }
  }

  /**
     * refreshAll
     */
  private _refreshAll(): void {
    this._refreshBody();
  }


// End of Private methods
}
