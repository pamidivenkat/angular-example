import { CheckListPageRouteResolve } from './../checklist/services/checklist-resolver.service';
import { SearchResultComponent } from './search-result/search-result.component';
import { LocalLogout } from './security/local-logout.component';
import { AuthCallback } from './security/auth-callback.component';
import { AuthGuard } from '../shared/security/auth.guard';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AppComponent } from './app.component';
import { Routes, RouterModule } from '@angular/router';

export const routes: Routes = [
    { path: '', loadChildren: 'app/home/home.module#HomeModule', data: { preload: false }, canActivate: [AuthGuard] },
    { path: 'dashboard', loadChildren: 'app/home/home.module#HomeModule', data: { preload: false }, canActivate: [AuthGuard] },
    { path: 'authcallback', component: AuthCallback },
    { path: 'locallogout', component: LocalLogout },
    {
        path: 'calendar',
        loadChildren: 'app/calendar/calendar.module#CalendarModule',
        data: { preload: false, title: 'Calendar' },
        canActivate: [AuthGuard]
    },
    {
        path: 'employee',
        loadChildren: 'app/employee/employee.module#EmployeeModule',
        data: { preload: false, title: 'Employee - Details' },
        canActivate: [AuthGuard]
    },
    {
        path: 'design',
        loadChildren: 'app/atlas-design/atlas-design.module#AtlasDesignModule',
        data: { preload: false },
        canActivate: [AuthGuard]
    },
    {
        path: 'task',
        loadChildren: 'app/task/task.module#TaskModule',
        data: { preload: false, title: 'Task -  List' },
        canActivate: [AuthGuard]
    },
    {
        path: 'document',
        loadChildren: 'app/document/document.module#DocumentModule',
        data: { preload: false, title: 'Documents - List' },
        canActivate: [AuthGuard]
    },
    {
        path: 'absence-management',
        loadChildren: 'app/holiday-absence/holiday-absence.module#HolidayAbsenceModule',
        data: { preload: false, title: 'My Holidays' },
        canActivate: [AuthGuard]
    },
    {
        path: 'training',
        loadChildren: 'app/training/training.module#TrainingModule',
        data: { preload: false, title: 'My Training' },
        canActivate: [AuthGuard]
    },
    {
        path: 'report',
        loadChildren: 'app/report/report.module#ReportModule',
        data: { preload: false, title: 'Reports' },
        canActivate: [AuthGuard]
    },
    {
        path: 'incident',
        loadChildren: 'app/incident-log/incident-log.module#IncidentLogModule',
        data: { preload: false, title: 'Incidents - List' },
        canActivate: [AuthGuard]
    },
    {
        path: 'company',
        loadChildren: 'app/company/company.module#CompanyModule',
        data: { preload: false, title: 'Company - Details' },
        canActivate: [AuthGuard]
    },

    {
        path: 'company/:id',
        loadChildren: 'app/company/company.module#CompanyModule',
        data: { preload: false, title: 'Employee - Details' },
        canActivate: [AuthGuard]
    },
    {
        path: 'checklist',
        loadChildren: 'app/checklist/checklist.module#ChecklistModule',
        data: { preload: false, title: 'Checklist - List' },
        canActivate: [AuthGuard],
        resolve: { filterStateClear: CheckListPageRouteResolve }
    },
    {
        path: 'method-statement',
        loadChildren: 'app/method-statements/method-statements.module#MethodStatementsModule',
        data: { preload: false, title: 'Method statements - List' },
    },
    {
        path: 'construction-phase-plan',
        loadChildren: 'app/construction-phase-plans/construction-phase-plans.module#ConstructionPhasePlanModule',
        data: { preload: false, title: 'Construction phase plan - List' },
        canActivate: [AuthGuard]
    },

    {
        path: 'coshh-inventory',
        loadChildren: 'app/coshh-inventory/coshh-inventory.module#CoshhInventoryModule',
        data: { preload: false, title: 'COSH inventory - List' },
    },
    {
        path: 'risk-assessment',
        loadChildren: 'app/risk-assessment/risk-assessment.module#RiskAssessmentModule',
        data: { preload: false, title: 'Risk assessment - List' },
        canActivate: [AuthGuard]
    },
    {
        path: 'icon-management',
        loadChildren: 'app/risk-assessment/icon-management/icon-management.module#IconManagementModule',
        data: { preload: false, title: 'Icon management' },
        canActivate: [AuthGuard]
    },
    {
        path: 'help',
        loadChildren: 'app/help/help.module#HelpModule',
        data: { preload: false, title: 'Help' },
        canActivate: [AuthGuard]
    },
    {
        path: 'search/results/:term',
        data: { preload: false, title: 'Search - Results' },
        component: SearchResultComponent
    },
    { path: '**', component: PageNotFoundComponent }
];
