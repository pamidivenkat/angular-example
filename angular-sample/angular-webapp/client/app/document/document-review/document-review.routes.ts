import { AuthGuard } from '../../shared/security/auth.guard';
import { Routes } from '@angular/router';
import { DocumentReviewComponent } from './container/document-review/document-review.component';

export const routes: Routes = [
    {
        path: '', component: DocumentReviewComponent, canActivate: [AuthGuard]
    },
     {
        path: ':id', component: DocumentReviewComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Document review' }
    }

]