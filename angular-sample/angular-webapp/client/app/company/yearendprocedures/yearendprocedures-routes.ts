import { AuthGuard } from './../../shared/security/auth.guard';
import { Routes } from '@angular/router';
import {
    YearendprocedureContainerComponent
} from './containers/yearendprocedure-container/yearendprocedure-container.component';

export const YearendProcedureRoutes: Routes = [
    {
        path: '', component: YearendprocedureContainerComponent, canActivate: [AuthGuard],
        children: [
            {
                path: 'teamcalendar',
                loadChildren: 'app/calendar/calendar.module#CalendarModule',
                data: { preload: false }, canActivate: [AuthGuard]
            },
        ]
    }
];
