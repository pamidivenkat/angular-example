import { HolidayRequestsGuard } from './holiday-requests-route-guard';
import {
  HolidayAbsencesRequestsContainerComponent
} from './containers/holiday-absences-requests-container/holiday-absences-requests-container.component';
import { HolidayAbsenceRequestsComponent } from './components/holiday-absence-requests/holiday-absence-requests.component';
import { AbsenceContainerComponent } from './containers/absence-container/absence-container.component';
import { HolidayContainerComponent } from './containers/holiday-container/holiday-container.component';
import { AuthGuard } from '../shared/security/auth.guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'holiday/:from', component: HolidayContainerComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Holidays' } },
  { path: 'holiday', component: HolidayContainerComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Holidays' } },
  { path: 'absence', component: AbsenceContainerComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Absences' } },
  {
    path: 'requests', component: HolidayAbsencesRequestsContainerComponent, canActivate: [AuthGuard, HolidayRequestsGuard], data: { preload: false, title: 'Holiday & absence requests' }
    ,
    children: [

      {
        path: 'teamcalendar',
        loadChildren: 'app/calendar/calendar.module#CalendarModule',
        data: { preload: false, title: 'Employee Calendar' }, canActivate: [AuthGuard]
      },
    ]
  },
  { path: 'requests/:id', component: HolidayAbsencesRequestsContainerComponent, canActivate: [AuthGuard, HolidayRequestsGuard], data: { preload: false, title: 'Employee holiday absences' } },
  {
    path: 'requests/employee/:id', component: HolidayAbsencesRequestsContainerComponent, canActivate: [AuthGuard, HolidayRequestsGuard], data: { preload: false, title: 'Employee holiday absences' }
    ,
    children: [

      {
        path: 'teamcalendar',
        loadChildren: 'app/calendar/calendar.module#CalendarModule',
        data: { preload: false, title: 'Employee Calendar' }, canActivate: [AuthGuard]
      },
    ]
  },
  { path: 'absence-type', loadChildren: 'app/holiday-absence/absencetype/absencetype.module#AbsenceTypeModule', data: { preload: false, title: 'Absence types - List' }, canActivate: [AuthGuard] },
  { path: 'requests/view/:filter', component: HolidayAbsencesRequestsContainerComponent, canActivate: [AuthGuard,HolidayRequestsGuard], data: { preload: false, title: 'Holiday & absence requests - filter view' } },
];
