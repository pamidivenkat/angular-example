import { Routes } from "@angular/router";
import { EmployeeBulkupdateContainerComponent } from "./containers/employee-bulkupdate-container/employee-bulkupdate-container.component";
import { AuthGuard } from "../../shared/security/auth.guard";

export const bulkUpdateRoutes: Routes = [
    {
        path: '', component: EmployeeBulkupdateContainerComponent, canActivate: [AuthGuard]
    }
];