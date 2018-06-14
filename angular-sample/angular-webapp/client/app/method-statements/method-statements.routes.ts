import { ManageListComponent } from './components/manage-list/manage-list.component';
import { MethodStatementsContainerComponent } from './containers/method-statements-container/method-statements-container.component';
import { Routes } from '@angular/router';
import { AuthGuard } from '../shared/security/auth.guard';
import { MethodStatementRouteResolve } from './method-statements-route-resolver';


export const routes: Routes = [
    {
        path: '',
        component: MethodStatementsContainerComponent,
        canActivate: [AuthGuard]
        , data: { preload: false, title: 'Methodstatement - List' }
        , children: [
            { path: 'live', component: ManageListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Live - Methodstatements' } },
            { path: 'pending', component: ManageListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Pending - Methodstatements' } },
            { path: 'completed', component: ManageListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Completed - Methodstatements' } },
            { path: 'examples', component: ManageListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Examples - Methodstatements' } },
            { path: 'archived', component: ManageListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Archived - Methodstatements' } }
        ]
    }
    , { path: 'procedure', loadChildren: 'app/method-statements/procedures/procedure.module#ProcedureModule', data: { preload: false, title: 'Procedures - List' }, canActivate: [AuthGuard] }
    , { path: 'plant-and-equipment', loadChildren: 'app/method-statements/plantandequipment/plantandequipment.module#PlantAndEquipmentModule', data: { preload: false, title: 'Plant & equipment - List' }, canActivate: [AuthGuard] }
    , { path: 'add', loadChildren: 'app/method-statements/manage-methodstatements/manage-methodstatements.module#ManageMethodStatementsModule', data: { preload: false, title: 'Methodstatement - Add' }, canActivate: [AuthGuard], resolve: { stateClear: MethodStatementRouteResolve } }
    , { path: 'add/:isExample', loadChildren: 'app/method-statements/manage-methodstatements/manage-methodstatements.module#ManageMethodStatementsModule', data: { preload: false, title: 'Methodstatement - Add - Example' }, canActivate: [AuthGuard], resolve: { stateClear: MethodStatementRouteResolve } }
    , { path: 'edit/:id', loadChildren: 'app/method-statements/manage-methodstatements/manage-methodstatements.module#ManageMethodStatementsModule', data: { preload: false, title: 'Methodstatement - Update' }, canActivate: [AuthGuard], resolve: { stateClear: MethodStatementRouteResolve } }
    , { path: 'edit/:isExample/:id', loadChildren: 'app/method-statements/manage-methodstatements/manage-methodstatements.module#ManageMethodStatementsModule', data: { preload: false, title: 'Methodstatement - Update - Example' }, canActivate: [AuthGuard], resolve: { stateClear: MethodStatementRouteResolve } }
    , { path: 'preview', loadChildren: 'app/method-statements/manage-methodstatements/manage-methodstatements.module#ManageMethodStatementsModule', data: { preload: false, title: 'Methodstatement - Update - Example' }, canActivate: [AuthGuard] }
    //   , { path: 'manage', loadChildren: 'app/method-statements/method-statements-manage/method-statements-manage.module#MethodStatementsManageModule', data: { preload: false }, canActivate: [AuthGuard] }
];
