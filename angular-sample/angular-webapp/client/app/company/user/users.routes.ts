import {
    UserUpdatePermissionsComponent
} from './components/user-update-permissions/user-update-permissions.component';
import { UsersContainerComponent } from './container/users-container/users-container.component';
import { AuthGuard } from '../../shared/security/auth.guard';
import { Routes } from '@angular/router';
export const routes: Routes = [
    {
        path: '', component: UsersContainerComponent, canActivate: [AuthGuard], resolve: {}
    },
    {
        path: 'updatepermissions/:id', component: UserUpdatePermissionsComponent, canActivate: [AuthGuard], resolve: {}
    }
];