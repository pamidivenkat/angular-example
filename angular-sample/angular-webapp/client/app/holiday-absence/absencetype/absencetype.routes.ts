import { AbsencetypeContainerComponent } from './containers/absencetype-container/absencetype-container.component';
import { AuthGuard } from "./../../shared/security/auth.guard";
import { Routes } from '@angular/router';

export const AbsenceTypeRoutes: Routes = [
  { path: '', component: AbsencetypeContainerComponent, canActivate: [AuthGuard]},
];