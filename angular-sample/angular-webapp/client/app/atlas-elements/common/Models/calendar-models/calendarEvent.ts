import { EventColorVM } from '../calendar-models/eventColor';
import { EventAction } from '../calendar-models/eventAction';

/**
* Main event model to hold an Calendar event 
*/
export interface CalendarEvent {
  start: Date;
  end?: Date;
  title: string;
  eventType? : string;
  color: EventColorVM;
  actions?: EventAction[];
  allDay?: boolean;
  cssClass?: string;
  span? : number;
  relatedTo? : string;
  id? : string;
}