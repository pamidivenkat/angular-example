import { ProcedureListComponent } from './components/procedure-list/procedure-list.component';
import { ProceduresContainerComponent } from './containers/procedures-container/procedures-container.component';
import { Routes } from '@angular/router';
import { AuthGuard } from './../../shared/security/auth.guard';


export const routes: Routes = [
    {
        path: '',
        component: ProceduresContainerComponent,
        canActivate: [AuthGuard]
        , children: [
            { path: 'custom', component: ProcedureListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Procedures - Custom' } },
            { path: 'example', component: ProcedureListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Procedures - Live' } }
        ]
    }
];
