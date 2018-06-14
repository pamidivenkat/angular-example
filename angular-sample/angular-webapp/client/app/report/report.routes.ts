import { AuthGuard } from '../shared/security/auth.guard';
import { ReportsComponent } from './containers/reports/report-component';
import { Routes } from '@angular/router';

export const routes: Routes = [{
    path: '', component: ReportsComponent, canActivate: [AuthGuard]
}]