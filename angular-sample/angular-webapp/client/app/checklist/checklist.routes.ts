import { ChecklistActionItemsComponent } from './components/action-checklist/action-checklist.component';
import { CheckListRouteResolve } from './services/checklist-resolver.service';
import { PreviewComponent } from './components/preview/preview.component';
import {
    CompanyExampleArchivedChecklistComponent
} from './components/company-example-archived-checklist/company-example-archived-checklist.component';
import { AddCheckListComponent } from './components/add/add.component';
import { ChecklistConstants } from './checklist-constants';
import { ChecklistContainerComponent } from './containers/checklist-container/checklist-container.component';
import { AuthGuard } from '../shared/security/auth.guard';
import { Routes } from '@angular/router';
import { TodaysOrCompleteIncompleteChecklistComponent } from './components/todays-or-complete-incomplete-checklist/todays-or-complete-incomplete-checklist.component';
import { ScheduledChecklistComponent } from './components/scheduled-checklist/scheduled-checklist.component';
import { ChecklistTabAuthGuard } from "./security/checklist-tab-guard";

export const routes: Routes = [
    {
        path: '', component: ChecklistContainerComponent, canActivate: [AuthGuard]
        , children: [
            { path: ChecklistConstants.Routes.TodaysChecklist, component: TodaysOrCompleteIncompleteChecklistComponent, canActivate: [AuthGuard, ChecklistTabAuthGuard], data: { title: 'Todays Checklist' } },
            { path: ChecklistConstants.Routes.Scheduled, component: ScheduledChecklistComponent, canActivate: [AuthGuard, ChecklistTabAuthGuard], data: { title: 'Scheduled Checklist' } },
            { path: ChecklistConstants.Routes.CompleteIncompleteStatus + "/:filterby", component: TodaysOrCompleteIncompleteChecklistComponent, canActivate: [AuthGuard, ChecklistTabAuthGuard], data: { title: 'Complete/InComplete Checklist' } },
            { path: ChecklistConstants.Routes.CompleteIncompleteStatus, component: TodaysOrCompleteIncompleteChecklistComponent, canActivate: [AuthGuard, ChecklistTabAuthGuard], data: { title: 'Complete/InComplete Checklist' } },
            { path: ChecklistConstants.Routes.CompanyChecklists, component: CompanyExampleArchivedChecklistComponent, canActivate: [AuthGuard, ChecklistTabAuthGuard], data: { title: 'Company Checklist' } },
            { path: ChecklistConstants.Routes.Examples, component: CompanyExampleArchivedChecklistComponent, canActivate: [AuthGuard, ChecklistTabAuthGuard], data: { title: 'Example Checklist' } },
            { path: ChecklistConstants.Routes.Archived, component: CompanyExampleArchivedChecklistComponent, canActivate: [AuthGuard, ChecklistTabAuthGuard], data: { title: 'Archived Checklist' } },
            { path: ChecklistConstants.Routes.ArchivedExample, component: CompanyExampleArchivedChecklistComponent, canActivate: [AuthGuard, ChecklistTabAuthGuard], data: { title: 'Archived Example Checklist' } },
        ]
    },
    {
        path: 'add', component: AddCheckListComponent, canActivate: [AuthGuard], resolve: { stateClear: CheckListRouteResolve }, data: { title: 'Checklist - Add' }
    },
    {
        path: 'add/:example', component: AddCheckListComponent, canActivate: [AuthGuard], resolve: { stateClear: CheckListRouteResolve }, data: { title: 'Checklist - Add - Example' }
    },
    {
        path: 'edit/:id', component: AddCheckListComponent, canActivate: [AuthGuard], resolve: { stateClear: CheckListRouteResolve}, data: { title: 'Checklist - Update' }
    },
    {
        path: 'edit/:example/:id', component: AddCheckListComponent, canActivate: [AuthGuard], resolve: { stateClear: CheckListRouteResolve}, data: { title: 'Checklist - Update' }
    },
    {
        path: 'archive/:id', component: PreviewComponent, canActivate: [AuthGuard], resolve: { stateClear: CheckListRouteResolve}, data: { title: 'Archived Checklist - View' } 
    },
    {
        path: 'example/archive/:id', component: PreviewComponent, canActivate: [AuthGuard], resolve: { stateClear: CheckListRouteResolve}, data: { title: 'Archived Checklist - View' } 
    },
    {
        path: 'example/:id', component: PreviewComponent, canActivate: [AuthGuard], resolve: { stateClear: CheckListRouteResolve}, data: { title: 'Example Checklist - View' } 
    },
    {
        path: 'preview/:id', component: PreviewComponent, canActivate: [AuthGuard], resolve: { stateClear: CheckListRouteResolve}, data: { title: 'Checklist - View' }
    },
    {
        path: 'action/:id', component: ChecklistActionItemsComponent, canActivate: [AuthGuard], resolve: { stateClear: CheckListRouteResolve}, data: { title: 'Checklist - Actions' } 
    }
];

