import { AeCalendarBaseClass } from '../ae-calendar-base';
import { Component, Input, OnChanges, Output, EventEmitter, ChangeDetectorRef, Inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CalendarEvent } from "../../../atlas-elements/common/models/calendar-models/calendarEvent";
import { DayViewEvent } from "../../../atlas-elements/common/models/calendar-models/dayViewEvent";
import { isNullOrUndefined } from "util";
import { isSameWeek, isSameYear, isSameDay } from "date-fns";



@Component({
  selector: 'ae-calendar-week-view',
  templateUrl: './ae-calendar-week-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./ae-calendar-week-view.component.scss']
})
export class AeCalendarWeekViewComponent extends AeCalendarBaseClass implements OnChanges {
  // constructor
  constructor(public cdr: ChangeDetectorRef) {
    super(cdr);
  }
  // End of constructor

  private _isOpen: boolean = false;
  private _moreEvents: CalendarEvent[];
  private _isOpenHour: boolean = false;
  private _moreEventsHour: CalendarEvent[]=[];
  
  get isOpen(): boolean{
    return this._isOpen;
  }

  get moreEvents(): CalendarEvent[]{
    return this._moreEvents;
  }

  get isOpenHour(): boolean{
    return this._isOpenHour;
  }

  get moreEventsHour(): CalendarEvent[]{
    return this._moreEventsHour;
  }

  getEvents(alevent : CalendarEvent, j:number, k:number,tdday : any) : boolean{
   if(alevent.allDay==true &&  j==k && (isSameWeek(alevent.start,tdday.date) && isSameYear(alevent.start,tdday.date) && isSameDay(alevent.start,tdday.date) || (tdday.date.getDay() ==0 && alevent.span>1 && tdday.date >= alevent.start && tdday.date <= alevent.end))){
      return true;
    }
    return false;
  }
  
  getMoreEventsCount(events: any): string {
    let eCount = events.length - 2; // As we are showing 2 minimum events per row
    if (eCount > 0) {
      return '+ ' + eCount + ' more';
    }
    return '';
  }  
  showEvents(event: any): void {
    this._isOpen = !this._isOpen;
    if (this._isOpen === true) {
      this._moreEvents = event;
      this._isOpenHour = false;
    } else {
      this._moreEvents = [];
    }
    this.cdr.markForCheck();

  }
  getMoreEventsCountForHours(events: DayViewEvent[], dayEvent : CalendarEvent): string {
    let eCount = events.filter(res=>res.event.start.getTime()===dayEvent.start.getTime() 
    || (res.event.start.getTime()>dayEvent.start.getTime() && res.event.end.getTime()>=dayEvent.end.getTime()) 
    || (res.event.start.getTime()>dayEvent.start.getTime() && res.event.end.getTime()<dayEvent.end.getTime())
    || (res.event.end.getTime()=== dayEvent.end.getTime() && res.event.start.getTime()< dayEvent.start.getTime())
    ).length - 1; // As we are showing 1 minimum events per column
    this._moreEventsHour = [];
    this._moreEvents = [];
    this.cdr.markForCheck();
    if (eCount > 0) {
      return '+ ' + eCount + ' more';
    }
    return '';
  }

 private _getEventsForDetailsHour(events : DayViewEvent[],dayEvent : CalendarEvent) : CalendarEvent[]{
    let hourEventDetails : CalendarEvent[];
    hourEventDetails = events.map(res=>{
      if(res.event.start === dayEvent.start && res.event.end === dayEvent.end){
        return res.event;
      }
    });
    return hourEventDetails;
  }
 showEventsForHoursMode(event: DayViewEvent[],dayEvent : CalendarEvent): void {
    this._isOpenHour = !this._isOpenHour;
    if (this._isOpenHour === true) {
       this._moreEventsHour = [];
     let filteredEvents : DayViewEvent[] = event.filter(res=> 
      res.event.start.getTime()===dayEvent.start.getTime() 
      || (res.event.start.getTime()>dayEvent.start.getTime() && res.event.end.getTime()>=dayEvent.end.getTime()) 
      || (res.event.start.getTime()>dayEvent.start.getTime() && res.event.end.getTime()<dayEvent.end.getTime())
      || (res.event.end.getTime()=== dayEvent.end.getTime() && res.event.start.getTime()< dayEvent.start.getTime())
      );
      this._moreEventsHour = filteredEvents.map(res=>{ if(!isNullOrUndefined(res.event)){
        return res.event;
      }});
      this._isOpen = false;
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
