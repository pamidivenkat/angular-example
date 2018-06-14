import { EmployeeBenefitsComponent } from './components/employee-benefits/employee-benefits.component';
import { AuthGuard } from './../../shared/security/auth.guard';
import { Routes } from '@angular/router';

export const benefitsRoutes: Routes = [
    {
        path: '', component: EmployeeBenefitsComponent, canActivate: [AuthGuard]
    }
];

