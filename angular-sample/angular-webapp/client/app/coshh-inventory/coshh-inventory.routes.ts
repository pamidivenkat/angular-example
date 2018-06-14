import { Routes } from '@angular/router';
import { AuthGuard } from '../shared/security/auth.guard';
import { CoshhInventoryContainerComponent } from './containers/coshh-inventory-container/coshh-inventory-container.component'

export const routes: Routes = [
    {
        path: '',
        component: CoshhInventoryContainerComponent,
        canActivate: [AuthGuard]
    }
];
