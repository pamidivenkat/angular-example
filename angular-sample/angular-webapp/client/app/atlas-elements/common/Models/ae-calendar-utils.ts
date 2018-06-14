import { isNullOrUndefined } from 'util';
import * as endOfDay from 'date-fns/end_of_day';
import * as addMinutes from 'date-fns/add_minutes';
import * as differenceInDays from 'date-fns/difference_in_days';
import * as startOfDay from 'date-fns/start_of_day';
import * as isSameDay from 'date-fns/is_same_day';
import * as getDay from 'date-fns/get_day';
import * as startOfWeek from 'date-fns/start_of_week';
import * as addDays from 'date-fns/add_days';
import * as endOfWeek from 'date-fns/end_of_week';
import * as differenceInSeconds from 'date-fns/difference_in_seconds';
import * as startOfMonth from 'date-fns/start_of_month';
import * as endOfMonth from 'date-fns/end_of_month';
import * as isSameMonth from 'date-fns/is_same_month';
import * as isSameSecond from 'date-fns/is_same_second';
import * as setHours from 'date-fns/set_hours';
import * as setMinutes from 'date-fns/set_minutes';
import * as startOfMinute from 'date-fns/start_of_minute';
import * as differenceInMinutes from 'date-fns/difference_in_minutes';
import * as addHours from 'date-fns/add_hours';
import * as isSunday from 'date-fns/is_sunday';
import * as isSaturday from 'date-fns/is_saturday';




import { CalendarEvent } from '../../common/models/calendar-models/calendarEvent';
import { DayViewEvent   } from '../../common/models/calendar-models/dayViewEvent';
import { WeekDayVM } from '../../common/models/calendar-models/weekDay';
import { EventAction } from '../../common/models/calendar-models/eventAction';
import { EventColorVM } from '../../common/models/calendar-models/eventColor';
import { DayVM } from '../../common/models/calendar-models/dayView';
import { DayViewHour } from '../../common/models/calendar-models/dayViewHour';
import { DayViewHourSegment } from '../../common/models/calendar-models/dayViewHourSegment';
import { MonthVM } from '../../common/models/calendar-models/monthView';
import { MonthViewDayVM  } from '../../common/models/calendar-models/monthViewDay';


// supported functions

const weekEndDayNumbers: number[] = [0, 6];
const daysInWeek: number = 7;
const hoursInDay: number = 24;
const minutesInHour: number = 60;

const getEventsInPeriod: Function = ({ events, periodStart, periodEnd }: GetEventsInPeriodArgs): CalendarEvent[] => {
  return events.filter((event: CalendarEvent) => isEventIsPeriod({ event, periodStart, periodEnd }));
};

const isEventIsPeriod: Function = ({ event, periodStart, periodEnd }: IsEventInPeriodArgs): boolean => {

  const eventStart: Date = event.start;
  const eventEnd: Date = event.end || event.start;

  if (eventStart > periodStart && eventStart < periodEnd) {
    return true;
  }

  if (eventEnd > periodStart && eventEnd < periodEnd) {
    return true;
  }

  if (eventStart < periodStart && eventEnd > periodEnd) {
    return true;
  }

  if (isSameSecond(eventStart, periodStart) || isSameSecond(eventStart, periodEnd)) {
    return true;
  }

  if (isSameSecond(eventEnd, periodStart) || isSameSecond(eventEnd, periodEnd)) {
    return true;
  }

  return false;

};


// End of supported functions

// Public methods

/**
* This method is used to get the formatted data to display events in day view of calendar
*/
export const getDayView: Function = ({ calendarView , events = [], viewDate, hourSegments, dayStart, dayEnd, eventWidth, segmentHeight }: GetDayViewArgs)
  : DayVM => {

  const startOfView: Date = setMinutes(setHours(startOfDay(viewDate), dayStart.hour), dayStart.minute);
  const endOfView: Date = setMinutes(setHours(startOfMinute(endOfDay(viewDate)), dayEnd.hour), dayEnd.minute);
  const previousDayEvents: DayViewEvent[] = [];

  const dayViewEvents: DayViewEvent[] = getEventsInPeriod({
    events: events.filter((event: CalendarEvent) => !event.allDay),
    periodStart: startOfView,
    periodEnd: endOfView
  }).sort((eventA: CalendarEvent, eventB: CalendarEvent) => {
    return eventA.start.valueOf() - eventB.start.valueOf();
  }).map((event: CalendarEvent) => {

    const eventStart: Date = event.start;
    const eventEnd: Date = event.end || eventStart;
    const startsBeforeDay: boolean = eventStart < startOfView;
    const endsAfterDay: boolean = eventEnd > endOfView;
    const hourHeightModifier: number = (hourSegments * segmentHeight) / minutesInHour;

    let top: number = 0;
    if (eventStart > startOfView) {
      top += differenceInMinutes(eventStart, startOfView);
    }
    top *= hourHeightModifier;

    const startDate: Date = startsBeforeDay ? startOfView : eventStart;
    const endDate: Date = endsAfterDay ? endOfView : eventEnd;
    let height: number = differenceInMinutes(endDate, startDate);
    if (!event.end) {
      height = segmentHeight;
    } else {
      height *= hourHeightModifier;
    }

    const bottom: number = top + height;

    const overlappingPreviousEvents: DayViewEvent[] = previousDayEvents.filter((previousEvent: DayViewEvent) => {
      const previousEventTop: number = previousEvent.top;
      const previousEventBottom: number = previousEvent.top + previousEvent.height;

      if (top < previousEventBottom && previousEventBottom < bottom) {
        return true;
      } else if (previousEventTop <= top && bottom <= previousEventBottom) {
        return true;
      }

      return false;

    });

    let left: number = 0;

    while (overlappingPreviousEvents.some(previousEvent => previousEvent.left === left)) {
      left += eventWidth;
    }

    const dayEvent: DayViewEvent = {
      event,
      height,
      width: eventWidth,
      top,
      left,
      startsBeforeDay,
      endsAfterDay
    };

    if (height > 0) {
      previousDayEvents.push(dayEvent);
    }

    return dayEvent;

  }).filter((dayEvent: DayViewEvent) => dayEvent.height > 0);

  const width: number = Math.max(...dayViewEvents.map((event: DayViewEvent) => event.left + event.width));
  const allDayEvents: CalendarEvent[] = getEventsInPeriod({
    events: events.filter((event: CalendarEvent) => event.allDay),
    periodStart: startOfDay(startOfView),
    periodEnd: endOfDay(endOfView)
  });

  const filteredAllDayEvents: CalendarEvent[] = [];

  allDayEvents.forEach((event: CalendarEvent, index: number) => {
    if(calendarView === 'day')
    {
        filteredAllDayEvents.push(event);
    } else
    if (filteredAllDayEvents.indexOf(event) === -1 && isSameDay(event.start, startOfView)) {
      if (isNullOrUndefined(event.end) || isSameDay(event.end, event.start)) {
        event.span = 1;
      } else {
        event.span = (differenceInDays(event.end, endOfWeek(event.start))) >= 0 ? differenceInDays(endOfWeek(event.start), event.start) + 1 : differenceInDays(event.end, event.start) + 1;
         if(event.span > 7){
          event.span = 7 ; // If duration is morethan 7 it spanover other week , UI issue fix
        }
      }
      filteredAllDayEvents.push(event);
    }
    else if (filteredAllDayEvents.indexOf(event) === -1 && isSunday(startOfView)) {
      event.span = differenceInDays(event.end, startOfView) + 1; // If event span over different weeks 
        if(event.span > 7){
          event.span = 7 ; // If duration is morethan 7 it spanover other week , UI issue fix
        }
      
      filteredAllDayEvents.push(event);
    }
  });


  return {
    events: dayViewEvents,
    width,
    allDayEvents: filteredAllDayEvents
  };

};

/**
* This method is used to get the hours list to display in day and week views of calendar
*/
export const getDayViewHourGrid: Function = ({ viewDate, hourSegments, dayStart, dayEnd }): DayViewHour[] => {

  const hours: DayViewHour[] = [];

  const startOfView: Date = setMinutes(setHours(startOfDay(viewDate), dayStart.hour), dayStart.minute);
  const endOfView: Date = setMinutes(setHours(startOfMinute(endOfDay(viewDate)), dayEnd.hour), dayEnd.minute);
  const segmentDuration: number = minutesInHour / hourSegments;
  const startOfViewDay: Date = startOfDay(viewDate);

  for (let i: number = 0; i < hoursInDay; i++) {
    const segments: DayViewHourSegment[] = [];
    for (let j: number = 0; j < hourSegments; j++) {
      const date: Date = addMinutes(addHours(startOfViewDay, i), j * segmentDuration);
      if (date >= startOfView && date < endOfView) {
        segments.push({
          date,
          isStart: j === 0
        });
      }
    }
    if (segments.length > 0) {
      hours.push({ segments });
    }
  }

  return hours;
};

/**
* This method is used to get the particular day of the week for given input date 
*/
export const getWeekDay: Function = ({ date }: { date: Date }): WeekDayVM => {
  const today: Date = startOfDay(new Date());
  const currDate: Date = new Date();
  return {
    date,
    isPast: date < today,
    isToday: isSameDay(date, today),
    //isToday: date.getDate() === currDate.getDate() ? true : false,
    isFuture: date > today,
    isWeekend: weekEndDayNumbers.indexOf(getDay(date)) > -1
  };
};

/**
* This method is used to get the Header part of calendar list of weekdays to display on header like Mon , Tue etc
*/
export const getWeekViewHeader: Function = ({ viewDate, weekStartsOn }: { viewDate: Date, weekStartsOn: number }): WeekDayVM[] => {

  const start: Date = startOfWeek(viewDate, { weekStartsOn });
  const days: WeekDayVM[] = [];
  for (let i: number = 0; i < daysInWeek; i++) {
    const date: Date = addDays(start, i);
    days.push(getWeekDay({ date }));
  }

  return days;

};

/**
* This method is used to get the formatted events to display in calendar month view
*/
export const getMonthView: Function = ({ events = [], viewDate, weekStartsOn }:
  { events: CalendarEvent[], viewDate: Date, weekStartsOn: number })
  : MonthVM => {

  const start: Date = startOfWeek(startOfMonth(viewDate), { weekStartsOn });
  const end: Date = endOfWeek(endOfMonth(viewDate), { weekStartsOn });
  const eventsInMonth: CalendarEvent[] = getEventsInPeriod({
    events,
    periodStart: start,
    periodEnd: end
  });
  const days: MonthViewDayVM[] = [];
  for (let i: number = 0; i < differenceInDays(end, start) + 1; i++) {
    const date: Date = addDays(start, i);
    const day: MonthViewDayVM = getWeekDay({ date });
    const events: CalendarEvent[] = getEventsInPeriod({
      events: eventsInMonth,
      periodStart: startOfDay(date),
      periodEnd: endOfDay(date)
    });
    day.inMonth = isSameMonth(date, viewDate);
    day.events = events;
    day.badgeTotal = events.length;
    days.push(day);
  }

  const rows: number = Math.floor(days.length / 7);
  const rowOffsets: number[] = [];
  for (let i: number = 0; i < rows; i++) {
    rowOffsets.push(i * 7);
  }

  return {
    rowOffsets,
    days
  };

};
// End of Public methods


// supported interfaces 

/**
* Supported interface for Dayview of calendar
*/
interface GetDayViewArgs {
  calendarView,
  events: CalendarEvent[];
  viewDate: Date;
  hourSegments: number;
  dayStart: {
    hour: number;
    minute: number;
  };
  dayEnd: {
    hour: number;
    minute: number;
  };
  eventWidth: number;
  segmentHeight: number;
}

/**
* Supported interface to split the events based on the period
*/
interface GetEventsInPeriodArgs {
  events: CalendarEvent[];
  periodStart: Date;
  periodEnd: Date;
}

/**
* Supported interface to split the events 
*/
interface IsEventInPeriodArgs {
  event: CalendarEvent;
  periodStart: Date;
  periodEnd: Date;
}

// End of supported interfaces