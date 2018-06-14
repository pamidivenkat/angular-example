import { EmployeeGroupContainerComponent } from './employee-group/employee-group.component';
import { AuthGuard } from '../../shared/security/auth.guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', component: EmployeeGroupContainerComponent, canActivate: [AuthGuard] }
]