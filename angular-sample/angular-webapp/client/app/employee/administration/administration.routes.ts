
import { AuthGuard } from './../../shared/security/auth.guard';
import { Routes } from '@angular/router';
import { EmployeeAdminContainerComponent } from "./containers/employee-admin-container/employee-admin-container.component";

export const adminRoutes: Routes = [
    {
        path: '', component: EmployeeAdminContainerComponent, canActivate: [AuthGuard]        
    },      
];

