
import { JobContainerComponent } from './containers/job-container/job-container.component';
import { AuthGuard } from './../../shared/security/auth.guard';
import { Routes } from '@angular/router';

export const jobRoutes: Routes = [
    {
        path: '', component: JobContainerComponent, canActivate: [AuthGuard]        
    },      
];

