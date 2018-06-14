import { AuthGuard } from './../../shared/security/auth.guard';
import { Routes } from '@angular/router';
import { EmployeeAddContainerComponent } from './containers/employee-add-container/employee-add-container.component';

export const employeeAddRoutes: Routes = [
    {
        path: '', component: EmployeeAddContainerComponent, canActivate: [AuthGuard]        
    },      
];

