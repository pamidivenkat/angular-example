import { Routes, RouterModule } from '@angular/router';
import { HolidaysettingsContainerComponent } from './containers/holidaysettings-container/holidaysettings-container.component';
import { AuthGuard } from './../../shared/security/auth.guard';

export const SettingsRoutes: Routes = [
  { path: '', component: HolidaysettingsContainerComponent, canActivate: [AuthGuard]},
];
