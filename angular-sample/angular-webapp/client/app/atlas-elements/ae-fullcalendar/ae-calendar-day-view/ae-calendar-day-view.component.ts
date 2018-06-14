import { isNullOrUndefined } from 'util';
import { AeCalendarBaseClass } from '../ae-calendar-base';

import { Component, Input, OnChanges, Output, EventEmitter, ChangeDetectorRef, LOCALE_ID, Inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CalendarEvent } from "../../../atlas-elements/common/models/calendar-models/calendarEvent";

/**
 * sigmentHeight constant
 */
const sigmentHeight: number = 30;

@Component({
  selector: 'ae-calendar-day-view',
  templateUrl: './ae-calendar-day-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./ae-calendar-day-view.component.scss']
})
export class AeCalendarDayViewComponent extends AeCalendarBaseClass implements OnChanges {
  private _isOpen : boolean =false;
   private _isOpenHour: boolean = false;
  private _moreEventsHour: CalendarEvent[];
  
  get isOpen() : boolean{
    return this._isOpen;
  }
  
  get isOpenHour(): boolean{
    return this._isOpenHour;
  }

  get moreEventsHour(): CalendarEvent[]{
    return this._moreEventsHour;
  }
  
  /**
   * constructor
   */
  constructor(public cdr: ChangeDetectorRef) {

    super(cdr);
  }
  // End of constructor

   getMoreEventsCount(events : any): string {
    let eCount = events.length - 2; // As we are showing 2 minimum events per row
    if (eCount > 0) {
      return '+ ' + eCount + ' more';
    }
    return '';
  }
showEvents (event : any) : void{
  this._isOpen = !this._isOpen;
   if (this._isOpen === true) {
      this._isOpenHour = false;
    }
  this.cdr.markForCheck();  
}

getMoreEventsCountForHours(events: any,dayEvent : CalendarEvent): string {
  if(!isNullOrUndefined(events) && !isNullOrUndefined(dayEvent))
  {
    let eCount = events.filter(res=>res.event.start.getTime()===dayEvent.start.getTime() 
    || (res.event.start.getTime()>dayEvent.start.getTime() && res.event.end.getTime()>=dayEvent.end.getTime()) 
    || (res.event.start.getTime()>dayEvent.start.getTime() && res.event.end.getTime()<dayEvent.end.getTime())
    || (res.event.end.getTime()=== dayEvent.end.getTime() && res.event.start.getTime()< dayEvent.start.getTime())
    ).length - 1; // As we are showing 1 minimum events per column
    if (eCount > 0) {
      return '+ ' + eCount + ' more';
    }
  }
    return '';
  }
 showEventsForHoursMode(event: any): void {
    this._isOpenHour = !this._isOpenHour;
    if (this._isOpenHour === true) {
      this._moreEventsHour = event;
      this._isOpen =false;
    } else {
      this._moreEventsHour = [];
    }
    this.cdr.markForCheck();

  }

  ngOnChanges(changes : any){
      super.ngOnChanges(changes);
      this._isOpen = false;
      this._isOpenHour = false;
  }
  

}