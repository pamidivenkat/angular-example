import { IconManagementGuard } from './security/icon-management-guard';
import { AuthGuard } from '../../shared/security/auth.guard';
import { IconManagementListComponent } from './components/icon-management-list/icon-management-list.component';
import { IconManagementConstants } from './icon-management-constants';
import { IconManagementContainerComponent } from './container/icon-management-container/icon-management-container.component';
import { Routes, RouterModule } from '@angular/router';

export const routes: Routes = [
    {
        path: ''
        , component: IconManagementContainerComponent
        , canActivate: [AuthGuard,IconManagementGuard]
        , data: { preload: false, title: 'Icon management' }
        , children: [
            { path: IconManagementConstants.Routes.Hazards, component: IconManagementListComponent, data: { preload: false, title: 'Hazard' } },
            { path: IconManagementConstants.Routes.Controls, component: IconManagementListComponent, data: { preload: false, title: 'Control' } },
        ]
    }
]