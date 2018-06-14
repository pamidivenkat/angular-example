import { ConstructionPhasePlanListComponent } from './components/construction-phase-plans/construction-phase-plans-list';
import { ConstructionPhasePlansComponent } from './container/construction-phase-plans/construction-phase-plans';
import { AuthGuard } from '../shared/security/auth.guard';
import { Routes } from '@angular/router';
import { CPPRouteResolve } from './construction-phase-plan-route-resolver';

export const routes: Routes = [
    { path: ''
            , component: ConstructionPhasePlansComponent
            , canActivate: [AuthGuard]
            , data: { preload: false, title: 'Construction phase plan - List' } 
            , children: [
            { path: 'live', component: ConstructionPhasePlanListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Live - Construction phase plan' } },
            { path: 'pending', component: ConstructionPhasePlanListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Pending - Construction phase plan' } },
            { path: 'overdue', component: ConstructionPhasePlanListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Overdue - Construction phase plan' } }
            ]
        }
    , { path: 'add', loadChildren: 'app/construction-phase-plans/manage-construction-plan/manage-construction-plan.module#ManageConstructionPlanModule', data: { preload: false , title: 'Construction phase plan - Add'}, canActivate: [AuthGuard], resolve: { stateClear: CPPRouteResolve } }
    , { path: 'edit/:id', loadChildren: 'app/construction-phase-plans/manage-construction-plan/manage-construction-plan.module#ManageConstructionPlanModule', data: { preload: false, title: 'Construction phase plan - Update' }, canActivate: [AuthGuard], resolve: { stateClear: CPPRouteResolve } }
    , { path: 'preview/:id', loadChildren: 'app/construction-phase-plans/construction-plan-view/construction-plan-view.module#ConstructionPlanViewModule', data: { preload: false, title: 'Construction phase plan - View' }, canActivate: [AuthGuard], resolve: { stateClear: CPPRouteResolve } }

];