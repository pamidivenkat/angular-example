import { CalendarComponent } from './components/calendar/calendar.component';
import { EmployeeCalendarComponent } from './components/employee-calendar/employee-calendar.component';

import { AuthGuard } from '../shared/security/auth.guard';
import { Routes } from '@angular/router';
import { TeamCalendarComponent } from './components/team-calendar/team-calendar.component';

export const CalendarRoutes: Routes = [
    { path: '', component: CalendarComponent, canActivate: [AuthGuard], data: { title: 'Calendar' } },
    { path: 'full', component: CalendarComponent, canActivate: [AuthGuard], data: { title: 'Calendar' } },
    { path: 'profile', component: EmployeeCalendarComponent, canActivate: [AuthGuard], data: { title: 'Calendar' } },
    { path: 'team', component: TeamCalendarComponent, canActivate: [AuthGuard], data: { title: 'Team Calendar' } },
    { path: 'teamholidays', component: CalendarComponent, canActivate: [AuthGuard], data: { title: 'Team Calendar' } }
];
