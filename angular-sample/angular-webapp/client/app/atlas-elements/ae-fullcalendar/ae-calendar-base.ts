import { BaseElementGeneric } from '../common/base-element-generic';
import { Component, Input, OnChanges, Output, EventEmitter, ChangeDetectorRef, LOCALE_ID, Inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

import { CalendarEvent } from '../common/models/calendar-models/calendarEvent';
import { DayVM } from '../common/models/calendar-models/dayView';
import { DayViewHour } from '../common/models/calendar-models/dayViewHour';
import { WeekDayVM } from '../common/models/calendar-models/weekDay';
import {
  getDayView,
  getDayViewHourGrid,
  getWeekViewHeader,
  getWeekDay
} from '../common/models/ae-calendar-utils';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
const sigmentHeight: number = 30;
export class AeCalendarBaseClass extends BaseElementGeneric<Date> implements OnChanges, OnInit, OnDestroy {

  // private fields

  private _displayView: string;
  private _viewDate: Date;
  private _events: CalendarEvent[];

  // End of private fields

  /**
   * The displayView of calendar view
   */
  @Input('displayView')
  get displayView() {
    return this._displayView;
  }

  set displayView(value: string) {
    this._displayView = value;
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
   * A function that will be called before each hour segment is called. The first argument will contain the hour segment.
   * If you add the `cssClass` property to the segment it will add that class to the hour segment in the template
   */
  @Input() hourSegmentModifier: Function;

  /**
   * Called when an event title is clicked
   */
  @Output() eventClicked: EventEmitter<{ event: CalendarEvent }> = new EventEmitter<{ event: CalendarEvent }>();

  // End of output bindings

  // public fields


  /**
   * list of hours
   */
  hours: DayViewHour[] = [];

  /**
   * day view 
   */
  view: DayVM[] = [];

  /**
   * @hidden
   */
  width: number = 0;
  /**
    * The start number of the week
    */
  weekStartsOn: number = 0;
  /**
     * WeekDay list
     */
  days: WeekDayVM[];

  /**
   * The grid size to snap resizing and dragging of events to
   */
  eventSnapSize: number = 30;


  /**
   * The number of segments in an hour. Must be <= 6
   */
  hourSegments: number = 2;

  /**
   * The day start hours in 24 hour time. Must be 0-23
   */
  dayStartHour: number = 0;

  /**
   * The day start minutes. Must be 0-59
   */
  dayStartMinute: number = 0;

  /**
   * The day end hours in 24 hour time. Must be 0-23
   */
  dayEndHour: number = 23;

  /**
   * The day end minutes. Must be 0-59
   */
  dayEndMinute: number = 59;

  /**
   * The width in pixels of each event on the view
   */
  eventWidth: number = 150;

  /**
  * isDayView
  */
  isDayView: boolean;
  /**
    * isWeekView
    */
  isWeekView: boolean;

  _formatedWeekView : CalendarEvent[] = [];

  get formatedWeekView(){
    return this._formatedWeekView;
  }


  // End of  public fields

  /**
   * constructor
   */
  constructor(public cdr: ChangeDetectorRef) {

    super(cdr);
  }
  // End of constructor

  /**
   * @Init method to set the default settings
   */
  ngOnInit(): void {
    this._setDayViewCss();
    this._refreshAll();
  }

  /**
   * @ngOnDestroy
   */
  ngOnDestroy(): void {
  }

  /**
   * @ngOnChanges
   */
  ngOnChanges(changes: any): void {
    this._setDayViewCss();
    if (changes.viewDate || changes.events) {
      this._refreshHeader();
      this._refreshView();
    }


  }


  // private methods 

  /**
 * to set the day view css class
 */
  private _setDayViewCss(): void {
    if (this.displayView === 'day') {
      this.isDayView = true;
      this.isWeekView = false;
    } else {
      this.isDayView = false;
      this.isWeekView = true;
    }
  }

  private _refreshHourGrid(): void {
    this.hours = getDayViewHourGrid({
      viewDate: this.viewDate,
      hourSegments: this.hourSegments,
      dayStart: {
        hour: this.dayStartHour,
        minute: this.dayStartMinute
      },
      dayEnd: {
        hour: this.dayEndHour,
        minute: this.dayEndMinute
      }
    });
    if (this.hourSegmentModifier) {
      this.hours.forEach(hour => {
        hour.segments.forEach(segment => this.hourSegmentModifier(segment));
      });
    }

  }
  private _refreshView(): void {
    this.view = [];
    this._formatedWeekView = [];
    for (let day of this.days) {
      let view = getDayView({
        calendarView: this.displayView,
        events: this.events,
        viewDate: day.date,
        hourSegments: this.hourSegments,
        dayStart: {
          hour: this.dayStartHour,
          minute: this.dayStartMinute
        },
        dayEnd: {
          hour: this.dayEndHour,
          minute: this.dayEndMinute
        },
        eventWidth: this.eventWidth,
        segmentHeight: sigmentHeight
      });
      this.view.push(view);
      let dayvm = <DayVM> view;
      if(dayvm.allDayEvents.length>0){
         this._formatedWeekView = this._formatedWeekView.concat(Array.from(dayvm.allDayEvents.slice(0,2)));
        
      }
    };
  }

  private _refreshHeader(): void {
    this.days = [];
    if (this.displayView === 'day') {
      this.days.push(getWeekDay({
        date: this.viewDate
      }));

    } else if (this.displayView === 'week') {

      this.days = getWeekViewHeader({
        viewDate: this.viewDate,
        weekStartsOn: this.weekStartsOn
      });
    }
  }

  private _refreshAll(): void {
    this._refreshHourGrid();
    this._refreshHeader();
    this._refreshView();
  }


  // End of private methods 
}