import { AuthGuard } from './../../shared/security/auth.guard';
import { Routes } from '@angular/router';
import {
    ManageDepartmentsContainerComponent
} from './containers/manage-departments-container/manage-departments-container.component';

export const ManageDepartmentRoutes: Routes = [
    {
        path: '', component: ManageDepartmentsContainerComponent, canActivate: [AuthGuard]
    }
];
