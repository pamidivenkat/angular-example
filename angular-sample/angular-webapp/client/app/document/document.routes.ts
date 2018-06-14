import { DraftDocumentRouteResolve } from './services/draft-document-route-resolver';
import { DocumentConstants } from './document-constants';
import { UsefuldocumentsDistributedComponent } from './components/usefuldocuments-distributed/usefuldocuments-distributed.component';
import { SharedDocumentsContainerComponent } from './containers/shared-documents-container/shared-documents-container.component';
import { PersonalDocumentsComponent } from './components/personal-documents/personal-documents.component';
import { CompanyDocumentsDistributedComponent } from './components/company-documents-distributed/company-documents-distributed.component';
import { DocumentListContainerComponent } from './containers/document-list-container/document-list-container.component';
import { AuthGuard } from '../shared/security/auth.guard';
import { Routes } from '@angular/router';
import { DocumentDetailsContainerComponent } from '../document/document-details/containers/document-details-container/document-details-container.component';



export const routes: Routes = [
    { path: DocumentConstants.Routes.DocumentDetails + "/:id", loadChildren: 'app/document/document-details/documentdetails.module#DocumentDetailsModule', canActivate: [AuthGuard], data: { preload: false, title: 'Document - Details' } },
    { path: DocumentConstants.Routes.SharedDocumentDetails + "/:id", loadChildren: 'app/document/document-details/documentdetails.module#DocumentDetailsModule', data: { preload: false, title: 'Shared document - Details' }, canActivate: [AuthGuard] },

    {
        path: '', component: DocumentListContainerComponent, canActivate: [AuthGuard], resolve: { stateClear: DraftDocumentRouteResolve }, data: { preload: false, title: 'Documents - List' }
        , children: [
            {

                path: DocumentConstants.Routes.SharedDocuments, component: SharedDocumentsContainerComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Shared documents' }
                , children: [
                    { path: DocumentConstants.Routes.DistributedDocuments, component: CompanyDocumentsDistributedComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Distributed documents' } },
                    { path: DocumentConstants.Routes.DistributedUsefulDocuments, component: UsefuldocumentsDistributedComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Distributed useful documents and templates' } }
                ]
            },
            { path: DocumentConstants.Routes.PersonalDocuments, component: PersonalDocumentsComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Personal documents' } },

            {
                path: DocumentConstants.Routes.CitationDrafts
                , loadChildren: 'app/document/citation-drafts-documents/citation-drafts-documents.module#CitationDraftsDocumentsModule',
                data: { preload: false, title: 'Citation draft documents' }
                , canActivate: [AuthGuard]
            },
            {
                path: DocumentConstants.Routes.CompanyDocuments
                , loadChildren: 'app/document/company-documents/company-documents.module#CompanyDocumentsModule',
                data: { preload: false, title: 'Company documents' }
                , canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: 'review', loadChildren: 'app/document/document-review/document-review.module#DocumentReviewModule', data: { preload: false, title: 'Document - Review' }, canActivate: [AuthGuard]
    },
    {
        path: 'group-contract-personalisation',
        loadChildren: 'app/document/contract-personalisation/contract-personalisation.module#ContractPersonalisationModule',
        data: { preload: false, title: 'Group contract personalisation' },
        canActivate: [AuthGuard]
    }
]

