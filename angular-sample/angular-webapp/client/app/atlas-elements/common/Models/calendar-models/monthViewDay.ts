
import { CalendarEvent } from '../calendar-models/calendarEvent';
import { WeekDayVM } from '../calendar-models/weekDay';

/**
* MonthView Day  model,  It's and individual month view day which holds whether that day is in month , it's events , some css
*/

export interface MonthViewDayVM extends WeekDayVM {
  inMonth: boolean;
  events: CalendarEvent[];
  backgroundColor?: string;
  cssClass?: string;
  badgeTotal: number;
  colSpan? : number;
}