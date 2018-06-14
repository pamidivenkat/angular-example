import { AuthGuard } from '../../shared/security/auth.guard';
import { Routes } from '@angular/router';
import { SitesContainerComponent } from './container/sites-container/sites-container.component';

export const routes: Routes = [
    {
        path: '', component: SitesContainerComponent, canActivate: [AuthGuard], resolve: {}
    }
];