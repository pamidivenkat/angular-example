import { CalendarEvent } from '../calendar-models/calendarEvent';

/**
* DayView Event model, It's an individual event with some information like deight , width , top , left of an event to display in calendar
*/
export interface DayViewEvent {
  event: CalendarEvent;
  height: number;
  width: number;
  top: number;
  left: number;
  startsBeforeDay: boolean;
  endsAfterDay: boolean;
}