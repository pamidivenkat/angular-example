import { Routes } from '@angular/router';

import { AuthGuard } from './../../shared/security/auth.guard';
import { DocumentConstants } from './../document-constants';
import { CompanyDocumentsListComponent } from './components/company-documents-list/company-documents-list.component';
import { ContractsTemplateListComponent } from './components/contracts-template-list/contracts-template-list.component';
import { HandbooksListComponent } from './components/handbooks-list/handbooks-list.component';
import {
    PersonalizedContractListComponent,
} from './components/personalized-contract-list/personalized-contract-list.component';
import {
    CompanyDocumentsContainerComponent,
} from './containers/company-documents-container/company-documents-container.component';
import {
    HandbookPoliciesContainerComponent,
} from './containers/handbook-policies-container/handbook-policies-container.component';
import {
    HRemployeeDocumentsContainerComponent,
} from './containers/hremployee-documents-container/hremployee-documents-container.component';
import { HSDocumentsContainerComponent } from './containers/hsdocuments-container/hsdocuments-container.component';
import { HankBookDocumentRouteResolve } from './services/handbooks-route-resolver';

export const routes: Routes = [
    {
        path: '', component: CompanyDocumentsContainerComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Company - Documents' }
        , children: [
            {
                path: DocumentConstants.Routes.HSDocuments, component: HSDocumentsContainerComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Health and safety documents' }
                , children:
                    [
                        {
                            path: DocumentConstants.Routes.HandBooksAndPolicies, component: CompanyDocumentsListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Handbooks and policy documents' }
                        }
                        , {
                            path: DocumentConstants.Routes.InspectionReports, component: CompanyDocumentsListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Inspection report documents' }
                        }
                        , {
                            path: DocumentConstants.Routes.HSDocumentSuite, component: CompanyDocumentsListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Health and safety documents suite' }
                        }
                        , {
                            path: DocumentConstants.Routes.HSDocumentSuite + '/category/:id/:status', component: CompanyDocumentsListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Health and safety documents suite' }
                        }
                    ]
            },
            {
                path: DocumentConstants.Routes.ContractsAndHandbooks, component: HandbookPoliciesContainerComponent, canActivate: [AuthGuard], resolve: { stateClear: HankBookDocumentRouteResolve }, data: { preload: false, title: 'Contacts and handbook documents' }
                , children:
                    [
                        {
                            path: DocumentConstants.Routes.HandBooks, component: HandbooksListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Hanbook documents' }
                        }
                        , {
                            path: DocumentConstants.Routes.ContractTemplates, component: ContractsTemplateListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Contract template documents' }
                        }
                        , {
                            path: DocumentConstants.Routes.PersonalisedContracts, component: PersonalizedContractListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Personalised contract documents' }
                        }
                    ]
            },
            {
                path: DocumentConstants.Routes.HREmployeeDocuments, component: HRemployeeDocumentsContainerComponent, canActivate: [AuthGuard], data: { preload: false, title: 'HR employee documents' }
                , children:
                    [
                        {
                            path: DocumentConstants.Routes.AppraisalReivews, component: CompanyDocumentsListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Appraisal and review documents' }
                        }
                        , {
                            path: DocumentConstants.Routes.Disciplinary, component: CompanyDocumentsListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Disciplinary documents' }
                        }
                        , {
                            path: DocumentConstants.Routes.TrainingDocuments, component: CompanyDocumentsListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Training documents' }
                        }
                        , {
                            path: DocumentConstants.Routes.StartersAndLeavers, component: CompanyDocumentsListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Starters and leavers documents' }
                        }
                        , {
                            path: DocumentConstants.Routes.General, component: CompanyDocumentsListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'General' }
                        }
                    ]
            },


            { path: DocumentConstants.Routes.EmployeeDocuments, component: CompanyDocumentsListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Employee documents' } },
            { path: DocumentConstants.Routes.ReviewPending, component: CompanyDocumentsListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Pending review documents' } },
            { path: DocumentConstants.Routes.Other, component: CompanyDocumentsListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Other documents' } }
            , { path: DocumentConstants.Routes.CompanyPolicies, component: CompanyDocumentsListComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Company policies documents' } }
            , {
                path: DocumentConstants.Routes.UsefulDocumentsAndTemplates
                , loadChildren: 'app/document/usefuldocuments-templates/usefuldocuments-templates.module#UsefuldocumentsandtemplatesModule'
                , data: { preload: false, title: 'Useful documents and templates - List' }
                , canActivate: [AuthGuard]
            }
        ]
    }


]

