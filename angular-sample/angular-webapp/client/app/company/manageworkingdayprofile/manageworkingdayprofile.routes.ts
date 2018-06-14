import { AuthGuard } from './../../shared/security/auth.guard';
import { Routes } from '@angular/router';
import {
    AddUpdateWorkingdayprofileContainerComponent
} from './containers/add-update-workingdayprofile-container/add-update-workingdayprofile-container.component';

export const ManageWorkingDayProfileRoutes: Routes = [
    {
        path: 'add/:type', component: AddUpdateWorkingdayprofileContainerComponent, canActivate: [AuthGuard], data: { title: 'Non working days and bank holidays - Add' }
    },
    {
        path: 'update/:type/:id', component: AddUpdateWorkingdayprofileContainerComponent, canActivate: [AuthGuard], data: { title: 'Non working days and bank holidays - Update' }
    }
];
