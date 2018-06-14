import { PreviewComponent } from './components/preview/preview.component';
import { MethodstatementContainerComponent } from './containers/methodstatement-container/methodstatement-container.component';
import { Routes } from '@angular/router';
import { AuthGuard } from './../../shared/security/auth.guard';


export const routes: Routes = [
    {
        path: '',
        component: MethodstatementContainerComponent,
        canActivate: [AuthGuard]
    },
    {
        path: ':status/:id',
        component: PreviewComponent,
        canActivate: [AuthGuard]
    }

];
