import { ConstructionPlanViewComponent } from './construction-plan-view/construction-plan-view.component';
import { AuthGuard } from './../../shared/security/auth.guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', component: ConstructionPlanViewComponent, canActivate: [AuthGuard] },
    
];