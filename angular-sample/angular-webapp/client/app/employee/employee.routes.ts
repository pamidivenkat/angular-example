import { EmployeeImportRouteResolve } from './security/employee-import-route-resolver';
import { EmployeeRouteResolve } from './security/employee-route-resolver';
import { TimelineComponent } from './employee-timeline/containers/timeline/timeline.component';
import { EmployeeVehicleComponent } from './components/employee-vehicle/employee-vehicle.component';
import { EmployeeBenefitsComponent } from './benefits/components/employee-benefits/employee-benefits.component';
import { EmployeeBankListComponent } from './components/employee-bank-list/employee-bank-list.component';
import { PreviousEmploymentComponent } from './components/previous-employment/previous-employment.component';
import { JobHistoryComponent } from './components/job-history/job-history.component';
import { SalaryHistoryComponent } from './components/salary-history/salary-history.component';
import { TrainingHistoryComponent } from './components/training-history/training-history.component';
import { QualificationHistoryComponent } from './components/qualification-history/qualification-history.component';
import { EducationHistoryComponent } from './components/education-history/education-history.component';
import { CareerTrainingContainerComponent } from './containers/career-training-container/career-training-container.component';
import { EmployeeContactsComponent } from './components/employee-contacts/employee-contacts.component';
import { EmployeeOptionsComponent } from './components/employee-options/employee-options.component';
import { EmployeePersonalComponent } from './components/employee-personal/employee-personal.component';
import { EmployeeConstants } from './employee-constants';
import { AuthGuard } from '../shared/security/auth.guard';
import { EmployeeContainerComponent } from './containers/employee-container/employee-container.component';
import { Routes } from '@angular/router';
import { CalendarRoutes } from './../calendar/calendar.routes';
import { BankContainerComponent } from "../employee/containers/bank-container/bank-container.component";
import { JobDetailsComponent } from './../employee/job/components/job-details/job-details.component';
import { EmployeeTabAuthGuard } from "./security/employee-tab-guard";
import { EmployeeImportHistoryContainerComponent } from "./employee-import/containers/employee-import-history-container/employee-import-history-container.component";

export const routes: Routes = [
    { path: 'manage', loadChildren: 'app/employee/employee-management/employee-management.module#EmployeeManagementModule', data: { preload: false, title: 'Employee - List' }, canActivate: [AuthGuard] },
    { path: 'add', loadChildren: 'app/employee/employee-add/employee-add.module#EmployeeAddModule', data: { preload: false, title: 'Employee - Add' }, canActivate: [AuthGuard] },
    {
        path: 'import', loadChildren: 'app/employee/employee-import/employee-import.module#EmployeeImportModule', data: { preload: false, title: 'Employee - Import' }, canActivate: [AuthGuard],resolve: { stateClear: EmployeeImportRouteResolve }
    },
    {
        path: 'bulkupdate', loadChildren: 'app/employee/employee-bulkupdate/employee-bulkupdate.module#EmployeeBulkupdateModule', data: { preload: false, title: 'Employees - Bulk update' }, canActivate: [AuthGuard],
    },

    {
        path: '', component: EmployeeContainerComponent, canActivate: [AuthGuard], resolve: { stateClear: EmployeeRouteResolve }
        , children: [
            { path: EmployeeConstants.Routes.Personal, component: EmployeePersonalComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { title: 'My Personal - Details' } },
            { path: 'job', loadChildren: 'app/employee/job/job.module#JobModule', data: { preload: false, title: 'My - Job - Details' }, canActivate: [AuthGuard, EmployeeTabAuthGuard] },
            { path: 'administration', loadChildren: 'app/employee/administration/administration.module#EmployeeAdminModule', data: { preload: false, title: 'My Admin - Details' }, canActivate: [AuthGuard, EmployeeTabAuthGuard] },
            { path: 'timeline', loadChildren: 'app/employee/employee-timeline/employee-timeline.module#EmployeeTimelineModule', data: { preload: false, title: 'My Timeline - Details' }, canActivate: [AuthGuard, EmployeeTabAuthGuard] },
            { path: EmployeeConstants.Routes.Options, component: EmployeeOptionsComponent, data: { preload: false, title: 'My - Options - Details' }, canActivate: [AuthGuard, EmployeeTabAuthGuard] },
            { path: EmployeeConstants.Routes.Contact, component: EmployeeContactsComponent, data: { preload: false, title: 'My - Contact - Details' }, canActivate: [AuthGuard, EmployeeTabAuthGuard] },
            {
                path: EmployeeConstants.Routes.CareerAndTraining, component: CareerTrainingContainerComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'My Career and training' }
                , children: [
                    { path: EmployeeConstants.Routes.EducationHistory, component: EducationHistoryComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'My Education history - List' } },
                    { path: EmployeeConstants.Routes.QualificationHistroy, component: QualificationHistoryComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'My Qualification history - List' } },
                    { path: EmployeeConstants.Routes.TrainingHistroy, component: TrainingHistoryComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'My Training history - List' } },
                    { path: EmployeeConstants.Routes.SalaryHistory, component: SalaryHistoryComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'My Salary history - List' } },
                    { path: EmployeeConstants.Routes.JobHistory, component: JobHistoryComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'My Job history - List' } },
                    { path: EmployeeConstants.Routes.PreviousEmployment, component: PreviousEmploymentComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'My Previous employment - List' } }
                ]
            },
            { path: 'calendar', loadChildren: 'app/calendar/calendar.module#CalendarModule', data: { preload: false, title: 'Calendar' }, canActivate: [AuthGuard, EmployeeTabAuthGuard] },
            { path: EmployeeConstants.Routes.Bank, component: BankContainerComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'My Bank - Details' } },
            { path: 'benefits', loadChildren: 'app/employee/benefits/benefits.module#BenefitsModule', data: { preload: false, title: 'My Benefits' }, canActivate: [AuthGuard, EmployeeTabAuthGuard] },
            { path: EmployeeConstants.Routes.Vehicle, component: EmployeeVehicleComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'My Vehicle - Details' } },
        ]
    },
    { path: 'delegation', loadChildren: 'app/employee/delegation/delegation.module#DelegationModule', data: { preload: false, title: 'Delegation' }, canActivate: [AuthGuard] },
    { path: 'settings', loadChildren: 'app/employee/settings/settings.module#SettingsModule', data: { preload: false, title: 'Employee settings' }, canActivate: [AuthGuard] },
    {
        path: 'employee-group', loadChildren: 'app/employee/employee-group/employee-group.module#EmployeeGroupModule', data: { preload: false, title: 'Employee group - List' }, canActivate: [AuthGuard]
    },
    {
        path: 'edit/:id', component: EmployeeContainerComponent, canActivate: [AuthGuard], resolve: { stateClear: EmployeeRouteResolve }, data: { preload: false, title: 'Employee - Details' }
        , children: [
            { path: EmployeeConstants.Routes.Personal, component: EmployeePersonalComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'Employee - Personal - Details' } },
            { path: 'job', loadChildren: 'app/employee/job/job.module#JobModule', data: { preload: false, title: 'Employee - Job - Details' }, canActivate: [AuthGuard, EmployeeTabAuthGuard] },
            { path: EmployeeConstants.Routes.Administration, loadChildren: 'app/employee/administration/administration.module#EmployeeAdminModule', data: { preload: false, title: 'Employee - Admin - Details' }, canActivate: [AuthGuard, EmployeeTabAuthGuard] },
            { path: 'timeline', loadChildren: 'app/employee/employee-timeline/employee-timeline.module#EmployeeTimelineModule', data: { preload: false, title: 'Employee - Timeline - Details' }, canActivate: [AuthGuard, EmployeeTabAuthGuard] },
            { path: EmployeeConstants.Routes.Options, component: EmployeeOptionsComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'Employee - Options - Details' } },
            { path: EmployeeConstants.Routes.Contact, component: EmployeeContactsComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'Employee - Contacts - Details' } },
            {
                path: EmployeeConstants.Routes.CareerAndTraining, component: CareerTrainingContainerComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'Employee - Career and training' }
                , children: [
                    { path: EmployeeConstants.Routes.EducationHistory, component: EducationHistoryComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'Employee - Education history - List' } },
                    { path: EmployeeConstants.Routes.QualificationHistroy, component: QualificationHistoryComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'Employee - Qualification history - List' } },
                    { path: EmployeeConstants.Routes.TrainingHistroy, component: TrainingHistoryComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'Employee - Training history - List' } },
                    { path: EmployeeConstants.Routes.SalaryHistory, component: SalaryHistoryComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'Employee - Salary history - List' } },
                    { path: EmployeeConstants.Routes.JobHistory, component: JobHistoryComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'Employee - Job history - List' } },
                    { path: EmployeeConstants.Routes.PreviousEmployment, component: PreviousEmploymentComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'Employee - Previous employment - List' } }
                ]
            },
            { path: 'calendar', loadChildren: 'app/calendar/calendar.module#CalendarModule', data: { preload: false, title: 'Employee -  Calendar' }, canActivate: [AuthGuard, EmployeeTabAuthGuard] },
            { path: EmployeeConstants.Routes.Bank, component: BankContainerComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'Employee - Bank - Details' } },
            { path: 'benefits', loadChildren: 'app/employee/benefits/benefits.module#BenefitsModule', canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'Employee - Benefits - Details' } },
            { path: EmployeeConstants.Routes.Vehicle, component: EmployeeVehicleComponent, canActivate: [AuthGuard, EmployeeTabAuthGuard], data: { preload: false, title: 'Employee - Vehicle - Details' } },

        ]
    }
];

