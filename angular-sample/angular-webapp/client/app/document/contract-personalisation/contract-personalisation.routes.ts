import {
    EmployeeContractUpdateComponent
} from './components/employee-contract-update/employee-contract-update.component';
import {
    ContractBulkDistributionComponent
} from './components/contract-bulk-distribution/contract-bulk-distribution.component';
import { AuthGuard } from '../../shared/security/auth.guard';
import { Routes } from '@angular/router';
import { ContractPersonalisationContainerComponent } from './container/contract-personalisation-container/contract-personalisation-container.component';

export const routes: Routes = [
    { path: ':id', component: ContractPersonalisationContainerComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Personalise contract' } },
    { path: 'bulk-distribute/:id/:version', component: ContractBulkDistributionComponent, canActivate: [AuthGuard] , data: { preload: false, title: 'Bulk contract distribution' }},
    { path: 'contract-update/:id', component: EmployeeContractUpdateComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Contract - Update' } }
]