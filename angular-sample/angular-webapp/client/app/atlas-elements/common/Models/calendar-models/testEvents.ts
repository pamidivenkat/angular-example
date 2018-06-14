// import { CalendarEvent } from '../calendar-models/calendarEvent';
  
// import * as endOfDay from 'date-fns/end_of_day';
// import  * as addMinutes from 'date-fns/add_minutes';
// import * as differenceInDays from 'date-fns/difference_in_days';
// import  * as startOfDay from 'date-fns/start_of_day';
// import  * as isSameDay from 'date-fns/is_same_day';
// import  * as getDay from 'date-fns/get_day';
// import  * as startOfWeek from 'date-fns/start_of_week';
// import  * as endOfWeek from 'date-fns/end_of_week';
// import  * as differenceInSeconds from 'date-fns/difference_in_seconds';
// import  * as startOfMonth from 'date-fns/start_of_month';
// import  * as endOfMonth from 'date-fns/end_of_month';
// import  * as isSameMonth from 'date-fns/is_same_month';
// import  * as isSameSecond from 'date-fns/is_same_second';
// import  * as setHours from 'date-fns/set_hours';
// import  * as setMinutes from 'date-fns/set_minutes';
// import  * as startOfMinute from 'date-fns/start_of_minute';
// import  * as differenceInMinutes from 'date-fns/difference_in_minutes';
// import  * as addHours from 'date-fns/add_hours';
// import  * as addDays from 'date-fns/add_days';
// import  * as subDays from 'date-fns/sub_days';




// const colors: any = {
//   red: {
//     primary: 'green',
//     secondary: 'green'
//   },
//   blue: {
//     primary: '#1e90ff',
//     secondary: '#D1E8FF'
//   },
//   yellow: {
//     primary: '#e3bc08',
//     secondary: '#FDF1BA'
//   },
//   pink:
// {
//   primary : 'pink',
//   secondary : 'pink'
// }
// };


// export class EventsTestData {

//    public static  events: CalendarEvent[] = [{
//      start: addHours(startOfDay(new Date()), 9),
//     end: addHours(startOfDay(new Date()), 12),
//     title: 'Demo',
//     color: colors.red,
//     allDay : true,
//     id : 1
  
//   },
//   {
//      start: addDays(startOfDay(new Date()),4),
//     end: addDays(startOfDay(new Date()), 4),
//     title: 'today week event',
//     color: colors.pink,
//     allDay : true,
//     id : 2
  
//   },
//    {
//      start: addDays(startOfDay(new Date()),8),
//     end: addDays(startOfDay(new Date()), 8),
//     title: 'week event',
//     color: colors.pink,
//     allDay : true,
//     id : 3
  
//   },
//   {
//    start: addDays(startOfDay(new Date()),7),
//     end: addDays(startOfDay(new Date()), 7),
//     title: 'week event 7',
//     color: colors.pink,
//     allDay : true  ,
//     id : 4
//   },
//   {
//      start: subDays(startOfDay(new Date()),1),
//     end: subDays(startOfDay(new Date()),1),
//     title: 'Angular',
//     color: colors.pink,
//     allDay : true,
//     id : 5
  
//   },
//   {
//      start: subDays(startOfDay(new Date()),2),
//     end: subDays(startOfDay(new Date()),2),
//     title: 'Demo session',
//     color: colors.pink,
//     allDay : true,
//     id : 6
  
//   },
//   {
//      start: addDays(startOfDay(new Date()),1),
//     end: addDays(startOfDay(new Date()),1),
//     title: 'Planned Demo',
//     color: colors.pink,
//     allDay : true,
//     id : 7
  
//   },
//   {
//      start: addDays(startOfDay(new Date()),2),
//     end: addDays(startOfDay(new Date()),2),
//     title: 'Demo meeting',
//     color: colors.pink,
//     allDay : true,
//     id : 8
  
//   },
//   {
//    start: addMinutes(addHours(startOfDay(new Date()), 4),30),
//     end: addMinutes(addHours(startOfDay(new Date()), 5),30),
//     title: 'Meeting1',
//     color: colors.red,
//     allDay : false,
//     id : 9
  
//   },
//    {
//    start: addMinutes(addHours(startOfDay(new Date()), 4),30),
//     end: addMinutes(addHours(startOfDay(new Date()), 5),30),
//     title: 'Meeting2',
//     color: colors.red,
//     allDay : false,
//     id : 18
  
//   },
//    {
//     start: startOfDay(new Date()),
//     title: 'seminar one',
//     color: colors.pink,
//     allDay : true,
//     id : 10
    
//   }, {
//      start: addMinutes(addHours(startOfDay(new Date()), 10),30),
//     end: addMinutes(addHours(startOfDay(new Date()), 11),30),
//     title: 'conference',
//     color: colors.blue,
//      allDay : false,
//     id : 11
//   }, {
//     start: addHours(startOfDay(new Date()), 13),
//     end: addHours(startOfDay(new Date()), 14),
//     title: 'Lunch',
//     color: colors.yellow,
//      allDay : false,
//     id : 12
   
//   },
//   {
//     start: addHours(addDays(startOfDay(new Date()), 1),3),
//     end: addHours(addDays(startOfDay(new Date()), 1),4),
//     title: 'Team meeting',
//     color: colors.yellow,
//      allDay : false,
//     id : 13
   
//   },
//   {
//     start: addHours(addDays(startOfDay(new Date()), 2),3),
//     end: addHours(addDays(startOfDay(new Date()), 2),4),
//     title: 'Demo meeting',
//     color: colors.yellow,
//      allDay : false,
//     id : 14
   
//   }
//   ,{
//     start: addHours(addDays(startOfDay(new Date()), 3),3),
//     end: addHours(addDays(startOfDay(new Date()),3),4),
//     title: 'Planning',
//     color: colors.yellow,
//      allDay : false,
//     id : 15
   
//   },
//    {
//     start: addHours(subDays(startOfDay(new Date()), 1),1),
//     end: addHours(subDays(startOfDay(new Date()), 1),2),
//     title: 'outing',
//     color: colors.yellow,
//      allDay : false,
//     id : 16
   
//   },
//    {
//     start: addHours(subDays(startOfDay(new Date()), 2),3),
//     end: addHours(subDays(startOfDay(new Date()), 1),4),
//     title: 'Team',
//     color: colors.yellow,
//      allDay : true,
//     id : 17
   
//   },
//    {
//     start: addHours(subDays(startOfDay(new Date()), 3),2),
//     end: addHours(subDays(startOfDay(new Date()), 3),3),
//     title: 'conference',
//     color: colors.yellow,
//      allDay : false,
//     id : 19
   
//   }];

// }


