import { IncidentContainerComponent } from './containers/incident-container/incident-container.component';
import { AuthGuard } from './../../shared/security/auth.guard';
import { Routes } from '@angular/router';

export const incidentRoutes: Routes = [
    {
        path: '', component: IncidentContainerComponent, canActivate: [AuthGuard]                
    }     
];

