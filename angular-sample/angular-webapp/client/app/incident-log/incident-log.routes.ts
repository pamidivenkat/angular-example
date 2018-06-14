import { Routes } from '@angular/router';
import { AuthGuard } from '../shared/security/auth.guard';
import { IncidentLogContainerComponent } from './containers/incident-log-container/incident-log-container.component';
import { IncidentRouteResolve } from './incident-route-resolver';

export const routes: Routes = [
    { path: '', component: IncidentLogContainerComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Incidents - List' } },
    { path: 'add', loadChildren: 'app/incident-log/incident/incident.module#IncidentModule', data: { preload: false, title: 'Incidents - Add' }, canActivate: [AuthGuard], resolve: { stateClear: IncidentRouteResolve } },
    { path: 'edit/:id', loadChildren: 'app/incident-log/incident/incident.module#IncidentModule', data: { preload: false, title: 'Incidents - Update' }, canActivate: [AuthGuard], resolve: { stateClear: IncidentRouteResolve } },
];
