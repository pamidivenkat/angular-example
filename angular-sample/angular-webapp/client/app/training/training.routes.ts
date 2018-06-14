import { TrainingContainerComponent } from './container/training-list-container/training-list-container.component';
import { AuthGuard } from '../shared/security/auth.guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', component: TrainingContainerComponent, canActivate: [AuthGuard] }
    , {
        path: 'report', loadChildren: 'app/training/training-reports/training-report.module#TrainingReportModule', data: { preload: false, title: 'Training reports - List' }, canActivate: [AuthGuard],
    }
    , { path: ':filterBy/:filterValue', component: TrainingContainerComponent, canActivate: [AuthGuard], data: { preload: false, title: 'My Training - List' } },
    {
        path: 'training-course', loadChildren: 'app/training/training-courses/training-courses.module#TrainingCourseModule', data: { preload: false, title: 'Training course - List' }, canActivate: [AuthGuard]
    }
];