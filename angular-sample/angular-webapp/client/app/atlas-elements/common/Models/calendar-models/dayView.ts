import { DayViewEvent } from '../calendar-models/dayViewEvent';
import { CalendarEvent } from '../calendar-models/calendarEvent';

/**
* Day view model of Calendar event 
*/
export interface DayVM {
  events: DayViewEvent[];
  width: number;
  allDayEvents: CalendarEvent[];
}