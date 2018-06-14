import { AuthGuard } from '../shared/security/auth.guard';
import { AtlasElementsComponent } from './atlas-elements/atlas-elements.component';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', component: AtlasElementsComponent, canActivate: [AuthGuard] },
]