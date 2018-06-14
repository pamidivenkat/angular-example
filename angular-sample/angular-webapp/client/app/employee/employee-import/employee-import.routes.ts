
import { Routes } from "@angular/router";
import { EmployeeImportContainerComponent } from "./containers/employee-import-container/employee-import-container.component";
import { AuthGuard } from "../../shared/security/auth.guard";
import { EmployeeImportHistoryContainerComponent } from "./containers/employee-import-history-container/employee-import-history-container.component";
import { EmployeeImportPreviewComponent } from "./components/employee-import-preview/employee-import-preview.component";

export const importRoutes: Routes = [
    {
        path: '', component: EmployeeImportContainerComponent, canActivate: [AuthGuard]
    },
    {
        path: 'preview', component: EmployeeImportPreviewComponent, canActivate: [AuthGuard]
    },
    {
        path: 'history', component: EmployeeImportHistoryContainerComponent, canActivate: [AuthGuard]
    },
];