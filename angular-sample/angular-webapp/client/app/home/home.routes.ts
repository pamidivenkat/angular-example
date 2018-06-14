import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from '../shared/security/auth.guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
];
