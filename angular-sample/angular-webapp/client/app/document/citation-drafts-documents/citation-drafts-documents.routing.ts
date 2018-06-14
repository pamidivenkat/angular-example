import { CitationDraftDocumentsListComponent } from './components/citation-draft-documents-list/citation-draft-documents-list.component';
import { DocumentConstants } from './../document-constants';
import { Routes } from '@angular/router';
import { AuthGuard } from './../../shared/security/auth.guard';

export const routes: Routes = [
    {
       path: '', component: CitationDraftDocumentsListComponent, canActivate: [AuthGuard]              
    }
]