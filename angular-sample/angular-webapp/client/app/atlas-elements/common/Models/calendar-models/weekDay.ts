/**
* WeekDay  model,  It's to display WeekDay inofmation at header part of the calendar
*/
export interface WeekDayVM {
  date: Date;
  isPast: boolean;
  isToday: boolean;
  isFuture: boolean;
  isWeekend: boolean;
}