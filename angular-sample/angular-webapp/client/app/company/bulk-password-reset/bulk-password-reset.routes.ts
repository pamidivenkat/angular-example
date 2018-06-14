import { BulkPasswordResetContainerComponent } from './container/bulk-password-reset-container/bulk-password-reset-container.component';
import { AuthGuard } from '../../shared/security/auth.guard';
import { Routes } from '@angular/router';
export const routes: Routes = [
    {
        path: '', component: BulkPasswordResetContainerComponent, canActivate: [AuthGuard] //, resolve: {}
    }
];