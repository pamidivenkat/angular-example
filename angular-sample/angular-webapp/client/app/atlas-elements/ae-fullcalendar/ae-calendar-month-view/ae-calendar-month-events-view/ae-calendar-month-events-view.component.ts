
import { BaseElementGeneric } from '../../../common/base-element-generic';
import { MonthViewDayVM  } from '../../../common/models/calendar-models/monthViewDay';
import { BehaviorSubject, Subject, Subscription } from 'rxjs/Rx';
import { CalendarEvent } from '../../../common/models/calendar-models/calendarEvent';
import {
  animate,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  style,
  transition,
  trigger
} from '@angular/core';

@Component({
  selector: 'ae-calendar-month-events-view',
  templateUrl: './ae-calendar-month-events-view.component.html',
  styleUrls: ['./ae-calendar-month-events-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('collapse', [
      transition('void => *', [
        style({ height: 0 }),
        animate('150ms linear', style({ height: '*' }))
      ]),
      transition('* => void', [
        style({ height: '*' }),
        animate('150ms linear', style({ height: 0 }))
      ])
    ])
  ]
})
export class AeCalendarMonthEventsViewComponent extends BaseElementGeneric<Date> implements OnChanges, OnInit, OnDestroy {

  private _dayClick:  BehaviorSubject<MonthViewDayVM>;
  private _isOpen :boolean =false;
 
  // Input bindings
  @Input('dayClick')
  get dayClick():  BehaviorSubject<MonthViewDayVM>{
    return this._dayClick;
  }
  set dayClick(day:  BehaviorSubject<MonthViewDayVM>) {
    this._dayClick = day;
  }

  // Input bindings
  @Input('isOpen')
  get isOpen():  boolean{
    return this._isOpen;
  }
  set isOpen(isOpen: boolean) {
    this._isOpen = isOpen;
  }

  // End of Input and Output bindings

  // public fields

   selectedDay: MonthViewDayVM ;

  // End of public fields

  constructor(public cdr: ChangeDetectorRef, private zone: NgZone) {
    super(cdr);
  }

  ngOnInit() {
    this._dayClick.subscribe((dayData) => {
      this.selectedDay = dayData;
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: any): void {
  }

  ngOnDestroy(): void {

  }

}
