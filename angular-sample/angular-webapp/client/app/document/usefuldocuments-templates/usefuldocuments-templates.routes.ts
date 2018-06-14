import { UsefuldocsTemplatesContainerComponent } from './containers/usefuldocs-templates-container/usefuldocs-templates-container.component';
import { DocumentConstants } from './../document-constants';
import { Routes } from '@angular/router';
import { AuthGuard } from './../../shared/security/auth.guard';

export const routes: Routes = [
    {
       path: '', component: UsefuldocsTemplatesContainerComponent, canActivate: [AuthGuard]              
    }
]

