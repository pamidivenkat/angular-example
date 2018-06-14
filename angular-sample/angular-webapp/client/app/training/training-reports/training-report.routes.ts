import { TrainingReportContainerComponent } from './container/training-report.component';
import { AuthGuard } from '../../shared/security/auth.guard';
import { Routes } from '@angular/router';


export const routes: Routes = [
    { path: ':filterBy', component: TrainingReportContainerComponent, canActivate: [AuthGuard],  data: { preload: false, title: 'Training - Report' }  },
    { path: '', component: TrainingReportContainerComponent, canActivate: [AuthGuard] }
]