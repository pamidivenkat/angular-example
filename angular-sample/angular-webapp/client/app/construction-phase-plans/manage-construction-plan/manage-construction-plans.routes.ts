import { ManageCppContainerComponent } from './containers/manage-cpp-container/manage-cpp-container.component';
import { AuthGuard } from './../../shared/security/auth.guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', component: ManageCppContainerComponent, canActivate: [AuthGuard] }    
];