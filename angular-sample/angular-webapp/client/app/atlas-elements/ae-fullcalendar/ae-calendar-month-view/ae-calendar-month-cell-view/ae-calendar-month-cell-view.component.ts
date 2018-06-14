import { BaseElementGeneric } from '../../../common/base-element-generic';
import { isNullOrUndefined } from 'util';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { MonthVM } from '../../../common/models/calendar-models/monthView';
import { MonthViewDayVM } from '../../../common/models/calendar-models/monthViewDay';
import { WeekDayVM } from '../../../common/models/calendar-models/weekDay';
import { CalendarEvent } from '../../../common/models/calendar-models/calendarEvent';
import { BehaviorSubject, Subject, Subscription } from 'rxjs/Rx';

@Component({
  selector: 'ae-calendar-month-cell-view',
  templateUrl: './ae-calendar-month-cell-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./ae-calendar-month-cell-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '"cal-cell cal-day-cell " + day?.cssClass',
    '[class.cal-today]': 'day.isToday',
    '[class.cal-weekend]': 'day.isWeekend',
    '[class.cal-in-month]': 'day.inMonth',
    '[class.cal-out-month]': '!day.inMonth',
    '[class.cal-has-events]': 'day.events.length > 0',
    '[class.cal-open]': 'day === openDay',
    '[style.backgroundColor]': 'day.backgroundColor'
  },
})
export class AeCalendarMonthCellViewComponent extends BaseElementGeneric<Date> implements OnChanges, OnInit, OnDestroy {

  //private fields

  private _dayClick: BehaviorSubject<MonthViewDayVM>;
  private _dayClickSubScription: Subscription;
  private _day: MonthViewDayVM;

  // End of private fields

  // Input bindings

  @Input('dayClick')
  set dayClick(val: BehaviorSubject<MonthViewDayVM>) {
    if (isNullOrUndefined(this._dayClick)) {
      this._dayClick = val;
    }
  }
  get dayClick() {
    return this._dayClick;
  }


  @Input('day')
  get day(): MonthViewDayVM {
    return this._day;
  }
  set day(val: MonthViewDayVM) {
    this._day = val;
  }

  // End of input bindings

  // constructor

  constructor(public cdr: ChangeDetectorRef) {
    super(cdr);
  }

  // End of constructor

  /**
   *ngOnInit
   */
  ngOnInit() {
    if (this.day.isToday && this.day.events.length > 0) {
      this.dayClick.next(this.day);
    }
  }


  /**
   *ngOnDestroy
   */
  ngOnDestroy(): void {

    if (this._dayClickSubScription) {
      this._dayClickSubScription.unsubscribe();
    }
  }
  /**
     *ngOnChanges
     */
  ngOnChanges(changes: any): void {

  }
  // public methods
  getMoreEventsCount(): string {
    let eCount = this.day.events.length - 3; // As we are showing 3 minimum events per cell
    if (eCount > 0) {
      return '+ ' + eCount + ' more';
    }
    return '';
  }

  showEvents(event: any) {
    event.stopPropagation();
    this._dayClick.next(this._day);
  }

  // End of public methods
}
