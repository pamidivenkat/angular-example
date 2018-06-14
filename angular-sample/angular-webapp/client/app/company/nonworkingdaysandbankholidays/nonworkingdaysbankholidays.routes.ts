import { CustomNonworkingdaysComponent } from './components/custom-nonworkingdays/custom-nonworkingdays.component';
import { StandardNonworkingdaysComponent } from './components/standard-nonworkingdays/standard-nonworkingdays.component';
import { NonworkingdaysContainerComponent } from './containers/nonworkingdays-container/nonworkingdays-container.component';
import { AuthGuard } from './../../shared/security/auth.guard';
import { Routes } from '@angular/router';

export const NonWorkingDaysBankHolidaysRoutes: Routes = [
    {
        path: '', component: NonworkingdaysContainerComponent, canActivate: [AuthGuard]
        , children: [
            { path: 'standard', component: StandardNonworkingdaysComponent, canActivate: [AuthGuard], data: { title: 'Standard non working days and bank holidays - List' } },
            { path: 'custom', component: CustomNonworkingdaysComponent, canActivate: [AuthGuard], data: { title: 'Custom non working days and bank holidays - List' } }
        ]
    }
];
