import { CalendarEvent } from '../calendar-models/calendarEvent';
/**
* Event Action  model,  to hold clicks on calendar event
*/
export interface EventAction {
  label: string;
  cssClass?: string;
  onClick({event}: {event: CalendarEvent}): any;
}