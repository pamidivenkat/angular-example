import { MonthViewDayVM  } from '../calendar-models/monthViewDay';
/**
* MonthView  model,  to  hold days , events in days and rowOffsets  to render events  in Calenar
*/
export interface MonthVM {
  rowOffsets: number[];
  days: MonthViewDayVM [];
}