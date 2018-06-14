import { CompanyContainerComponent } from './containers/company-container/company-container.component';
import { AuthGuard } from '../shared/security/auth.guard';
import { CompanySitesAuthGuard } from './security/site-auth-guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '', component: CompanyContainerComponent, canActivate: [AuthGuard], resolve: {}
    }
    , {
        path: 'user/:id', loadChildren: 'app/company/user/users.module#UsersModule', data: { preload: false, title: 'User - View' }, canActivate: [AuthGuard]
    }
    , {
        path: 'user', loadChildren: 'app/company/user/users.module#UsersModule', data: { preload: false, title: 'User - List' }, canActivate: [AuthGuard]
    }
    , {
        path: 'bulk-password-reset', loadChildren: 'app/company/bulk-password-reset/bulk-password-reset.module#BulkPasswordResetModule', data: { preload: false, title: 'Bulk Reset Password' }, canActivate: [AuthGuard]
    }
    , {
        path: 'site/:id', loadChildren: 'app/company/sites/sites.module#SitesModule', data: { preload: false, title: 'Site - View' }, canActivate: [AuthGuard, CompanySitesAuthGuard]
    }
    , {
        path: 'site', loadChildren: 'app/company/sites/sites.module#SitesModule', data: { preload: false, title: 'Site - List' }, canActivate: [AuthGuard, CompanySitesAuthGuard]
    },
    { path: 'non-working-days-and-bank-holidays', loadChildren: 'app/company/nonworkingdaysandbankholidays/nonworkingdaysbankholidays.module#NonworkingdaysbankholidaysModule', data: { preload: false, title: 'Non working days and bank holidays - List' }, canActivate: [AuthGuard] },
    {
        path: 'non-working-days-and-bank-holiday'
        , loadChildren: 'app/company/manageworkingdayprofile/manageworkingdayprofile.module#ManageworkingdayprofileModule'
        , data: { preload: false }
        , canActivate: [AuthGuard]
    },
    {
        path: 'department'
        , loadChildren: 'app/company/manage-departments/manage-departments.module#ManageDepartmentsModule'
        , data: { preload: false, title: 'Departments - Manage' }
        , canActivate: [AuthGuard]
    },
    {
        path: 'year-end-procedure'
        , loadChildren: 'app/company/yearendprocedures/yearendprocedures.module#YearendproceduresModule'
        , data: { preload: false, title: 'Year end procedures' }
        , canActivate: [AuthGuard]
    }
];

