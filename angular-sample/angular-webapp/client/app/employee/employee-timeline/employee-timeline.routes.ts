import { TimelineComponent } from './containers/timeline/timeline.component';
import { AuthGuard } from '../../shared/security/auth.guard';
import { Routes } from '@angular/router';

export const employeeTimelineRoutes: Routes = [
    {
        path: '', component: TimelineComponent, canActivate: [AuthGuard]        
    },      
];
