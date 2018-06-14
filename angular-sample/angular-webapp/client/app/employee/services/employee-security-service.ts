import { isNullOrUndefined } from 'util';
import { EmployeeConstants } from '../employee-constants';
import { Injectable } from '@angular/core';
import { RouteParams } from './../../shared/services/route-params';
import { ClaimsHelperService } from './../../shared/helpers/claims-helper';

@Injectable()
export class EmployeeSecurityService {
    private _empIdTryingToAccess: string;


    CanViewPersonal(empId: string): boolean {
        return this._claimsHelper.canViewEmpBasic() || this._claimsHelper.canViewEmpAdvance() || this._claimsHelper.canViewDeptEmps() || this._claimsHelper.canManageDeptEmps() || this._claimsHelper.canManageClientEmps();
    }

    CanUpdatePersonal(empId: string): boolean {
        return ((this._claimsHelper.canManageEmpBasic() && empId.toLocaleLowerCase() == this._claimsHelper.getEmpIdOrDefault().toLocaleLowerCase()) || (this._claimsHelper.canManageEmpAdvance() || this._claimsHelper.canManageEmpSensitive() || this._claimsHelper.canViewAllEmployees() || this._claimsHelper.canManageDeptEmps()) || this._claimsHelper.canManageClientEmps());
    }

    CanViewJob(empId: string): boolean {
        return this._claimsHelper.canViewEmpAdvance() || this._claimsHelper.canViewAllEmployees() || this._claimsHelper.canViewDeptEmps() || this._claimsHelper.canManageDeptEmps() || this._claimsHelper.canManageClientEmps();
    }

    CanUpdateJob(empId: string): boolean {
        return this._claimsHelper.canManageEmpSensitive() || this._claimsHelper.canViewAllEmployees() || this._claimsHelper.canManageClientEmps();
    }

    CanViewContact(empId: string): boolean {
        return this._claimsHelper.canViewEmpBasic() || this._claimsHelper.canViewEmpAdvance() || this._claimsHelper.canViewAllEmployees() || this._claimsHelper.canViewDeptEmps() || this._claimsHelper.canManageDeptEmps() || this._claimsHelper.canManageClientEmps();
    }

    CanUpdateContact(empId: string): boolean {
        return (this._claimsHelper.canManageEmpBasic() && this._claimsHelper.getEmpIdOrDefault().toLocaleLowerCase() == empId.toLocaleLowerCase()) || this._claimsHelper.canManageEmpSensitive() || this._claimsHelper.canViewAllEmployees() || this._claimsHelper.canManageClientEmps();
    }

    CanViewHistory(empId: string): boolean {
        return this._claimsHelper.canViewEmpBasic() || this._claimsHelper.canViewEmpAdvance() || this._claimsHelper.canViewAllEmployees() || this._claimsHelper.canViewDeptEmps() || this._claimsHelper.canManageDeptEmps() || this._claimsHelper.canManageClientEmps();
    }

    CanUpdateHistory(empId: string): boolean {
        return ((this._claimsHelper.canManageEmpBasic() && empId.toLocaleLowerCase() == this._claimsHelper.getEmpIdOrDefault().toLocaleLowerCase()) || (this._claimsHelper.canManageEmpAdvance() || this._claimsHelper.canManageEmpSensitive() || this._claimsHelper.canViewAllEmployees() || this._claimsHelper.canManageDeptEmps()) || this._claimsHelper.canManageClientEmps());
    }

    CanViewBank(empId: string): boolean {
        if (this._routeParams.Cid && this._claimsHelper.IsCitationUser) {
            //if citation user is accessing client employee details we should not show bank details as per APB-19977
            return false;
        } else {
            return (this._claimsHelper.canViewEmpBasic()) || this._claimsHelper.canViewEmpSensitive() || this._claimsHelper.canViewAllEmployees();
        }
    }

    CanUpdateBank(empId: string): boolean {
        if (this._routeParams.Cid && this._claimsHelper.IsCitationUser) {
            //if citation user is accessing client employee details we should not update bank details as per APB-19977
            return false;
        } else {
            return this._claimsHelper.canManageEmpSensitive() || this._claimsHelper.canViewAllEmployees();
        }
    }

    CanViewBenefits(empId: string): boolean {
        return this._claimsHelper.canViewEmpSensitive() || this._claimsHelper.canManageClientEmps();
    }

    CanUpdateBenefits(empId: string): boolean {
        return this._claimsHelper.canManageEmpSensitive() || this._claimsHelper.canManageClientEmps();
    }

    CanViewVehicle(empId: string): boolean {
        return this._claimsHelper.canViewEmpBasic() || this._claimsHelper.canViewEmpAdvance() || this._claimsHelper.canViewAllEmployees() || this._claimsHelper.canViewDeptEmps() || this._claimsHelper.canManageDeptEmps() || this._claimsHelper.canManageClientEmps();
    }

    CanUpdateVehicle(empId: string): boolean {
        return ((this._claimsHelper.canManageEmpBasic() && empId.toLocaleLowerCase() == this._claimsHelper.getEmpIdOrDefault().toLocaleLowerCase()) || (this._claimsHelper.canManageEmpAdvance() || this._claimsHelper.canManageEmpSensitive() || this._claimsHelper.canViewAllEmployees() || this._claimsHelper.canManageDeptEmps()) || this._claimsHelper.canManageClientEmps());
    }

    CanViewCalendar(empId: string): boolean {
        return this._claimsHelper.canAccessHolidaysAndAbsence() || this._claimsHelper.canViewDeptEmps() || this._claimsHelper.canManageDeptEmps() || this._claimsHelper.canManageClientEmps();
    }

    CanViewAdmin(empId: string): boolean {
        return this._claimsHelper.canViewEmpSensitive() || this._claimsHelper.canViewAllEmployees() || this._claimsHelper.canManageClientEmps();
    }

    CanUpdateAdmin(empId: string): boolean {
        return this._claimsHelper.canViewEmpSensitive() || this._claimsHelper.canViewAllEmployees() || this._claimsHelper.canManageClientEmps();
    }

    CanViewTimeline(empId: string): boolean {
        //return true;
        return ((this._claimsHelper.getEmpIdOrDefault().toLocaleLowerCase() != empId.toLocaleLowerCase()) && (this._claimsHelper.canViewEmpAdvance() || this._claimsHelper.canViewEmpSensitive() || this._claimsHelper.canViewDeptEmps() || this._claimsHelper.canManageClientEmps()));
    }

    CanUpdateTimeline(empId: string): boolean {
        return ((this._claimsHelper.getEmpIdOrDefault().toLocaleLowerCase() != empId.toLocaleLowerCase()) && (this._claimsHelper.canViewEmpAdvance() || this._claimsHelper.canManageDeptEmps() || this._claimsHelper.canViewEmpSensitive()));
    }

    CanUpdateJobHistory(empId: string): boolean {
        return ((this._claimsHelper.getEmpIdOrDefault().toLocaleLowerCase() != empId.toLocaleLowerCase()) && (this._claimsHelper.canViewEmpSensitive() || this._claimsHelper.canViewAllEmployees()) || this._claimsHelper.canManageClientEmps());
    }

    CanUpdateSalaryHistory(empId: string): boolean {
        return ((this._claimsHelper.getEmpIdOrDefault().toLocaleLowerCase() != empId.toLocaleLowerCase()) && (this._claimsHelper.canViewEmpSensitive() || this._claimsHelper.canViewAllEmployees()) || this._claimsHelper.canManageClientEmps());
    }

    CanViewOptions(empId: string): boolean {
        return this._claimsHelper.canManageEmpSensitive() || this._claimsHelper.canViewAllEmployees() || this._claimsHelper.canManageClientEmps();
    }

    CanUpdateOptions(empId: string): boolean {
        return this._claimsHelper.canManageEmpSensitive() || this._claimsHelper.canViewAllEmployees() || this._claimsHelper.canManageClientEmps();
    }

    CanView(tabName: string, empId: string) {
        tabName = tabName.toLowerCase();
        if (isNullOrUndefined(empId)) {
            empId = ''; //just to avoid any error
        }
        switch (tabName) {
            case EmployeeConstants.Routes.Personal:
                return this.CanViewPersonal(empId);
            case EmployeeConstants.Routes.Job:
                return this.CanViewJob(empId);
            case EmployeeConstants.Routes.Timeline:
                return this.CanViewTimeline(empId);
            case EmployeeConstants.Routes.Options:
                return this.CanViewOptions(empId);
            case EmployeeConstants.Routes.Contact:
                return this.CanViewContact(empId);
            case EmployeeConstants.Routes.CareerAndTraining:
                return this.CanViewHistory(empId);
            case EmployeeConstants.Routes.EducationHistory:
                return this.CanViewHistory(empId);
            case EmployeeConstants.Routes.QualificationHistroy:
                return this.CanViewHistory(empId);
            case EmployeeConstants.Routes.TrainingHistroy:
                return this.CanViewHistory(empId);
            case EmployeeConstants.Routes.SalaryHistory:
                return this.CanViewHistory(empId);
            case EmployeeConstants.Routes.JobHistory:
                return this.CanViewHistory(empId);
            case EmployeeConstants.Routes.PreviousEmployment:
                return this.CanViewHistory(empId);
            case EmployeeConstants.Routes.Calendar:
                return this.CanViewCalendar(empId);
            case EmployeeConstants.Routes.Bank:
                return this.CanViewBank(empId);
            case EmployeeConstants.Routes.Benefits:
                return this.CanViewBenefits(empId);
            case EmployeeConstants.Routes.Vehicle:
                return this.CanViewVehicle(empId);
            case EmployeeConstants.Routes.Administration:
                return this.CanViewAdmin(empId);
            default:
                break;
        }
    }
    constructor(private _claimsHelper: ClaimsHelperService, private _routeParams: RouteParams) {
    }
}
