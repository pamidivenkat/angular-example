
import { AuthGuard } from './../../shared/security/auth.guard';
import { Routes } from '@angular/router';
import { DocumentDetailsContainerComponent } from "./containers/document-details-container/document-details-container.component";
import { DocumentConstants } from './../../document/document-constants';
import { DocumentChangeHistoryComponent } from './../../document/document-details/components/document-change-history/document-change-history.component';
import { DocumentDistributeHistoryComponent } from './../../document/document-details/components/document-distribute-history/document-distribute-history.component';
import { DocumentEmployeeActionstatusComponent } from './../../document/document-details/components/document-employee-actionstatus/document-employee-actionstatus.component';

export const documentDetailsRoutes: Routes = [
    // Eg : /documents/shared-document-details/1

    {
        path: '', component: DocumentDetailsContainerComponent, canActivate: [AuthGuard],
        children: [
            { path: DocumentConstants.Routes.DocumentChangeHistory, component: DocumentChangeHistoryComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Document change history' } },
            { path: DocumentConstants.Routes.DistributeHistory, component: DocumentDistributeHistoryComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Document distribution history' } },
            { path: DocumentConstants.Routes.EmployeeStatus, component: DocumentEmployeeActionstatusComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Document employee action status' } }

        ]

    },
];

