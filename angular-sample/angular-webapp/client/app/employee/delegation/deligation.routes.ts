import { AuthGuard } from './../../shared/security/auth.guard';
import { DelegationContainerComponent } from './containers/deligation-container/deligation-container.component';
import { Routes } from '@angular/router';

export const DeligationRoutes: Routes = [
    { path: '', component: DelegationContainerComponent, canActivate: [AuthGuard] },   
];
 