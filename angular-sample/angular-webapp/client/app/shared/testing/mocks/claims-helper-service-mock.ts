import { Injectable } from '@angular/core';
@Injectable()
export class ClaimsHelperServiceStub {
    public SetUpdatedClaims() {

    }
    public TriggerToUpdatedClaimsFromEmpPersonal() {

    }
    get HasCid() {
        return true;
    }
    get IsCitationCid() {
        return true;
    }
    get IsCitationUser() {
        return true;
    }

    get IsLoadExampleProfiles() {
        return true;
    }

    public hasRole(name: string) {

    }
    public hasAnyRole(codes: string[]) {

    }
    //region to assert all permission related conditions
    get canDistributeAnyDocument() {
        return true;
    }
    get canDistributeAnySharedDocument() {
        return true;
    }

    //end of region to assert all permission related conditions
    public getCompanyName() {

    }

    public getCompanyCountryId() {

    }
    public getCompanyId() {

    }

    public getCompanyIdOrCid() {

    }

    public getCompanyStructureTypeId() {

    }
    public getEmpEmail() {

    }
    public getEmpHomePhone() {

    }
    public getEmpPictureUrl() {

    }
    public getEmpId() {

    }
    public getEmpIdOrDefault() {

    }
    public getIsDeligatedAuthorizor() {

    }
    public getParentCompanyId() {

    }
    public getSectorId() {

    }
    public getSectorName() {

    }
    public getTenantName() {

    }
    public getUserFullName() {
        return "user name";
    }
    public getUserName() {

    }
    public getSiteId() {

    }
    public getDepartmentId() {

    }
    public getAdviceCardNumber() {

    }
    public getEmpDOB() {

    }
    public getUserId() {
        return "55D1130C-6B4A-462A-A47F-D8DF2F6B8C73";
    }
    public getUserFirstName() {

    }
    public getUserLastName() {

    }

    public isEmployee() {

    }
    public isHRManagerOrServiceOwner() {

    }
    public isHolidayAuthorizerOrManager() {

    }
    public isAdministrator() {

    }
    public isConsultant() {

    }
    public isHSConsultant() {

    }
    public canManageCompany() {

    }
    public canViewOthersCalendar() {

    }
    //Adding decision level properties and these are fullfiiled when set method is called and is called after user is autohrized and when route 
    //is changed with cid then also this needs to be set or the base-layout component after Init this needs to be called which will satisfy direct routing from v1 to v2 too
    public canAddHolidayOnbehalf() {

    }

    public canManageClientEmps() {

    }

    public canManageEmpProCat() {

    }

    public isHSOrELConsultant() {

    }

    public canViewDeptEmps() {

    }

    public canManageDeptEmps() {

    }

    public canManageEmpSensitive() {

    }

    public canManageEmpAdvance() {

    }

    public canManageEmpBasic() {

    }

    public canManagePredefinedWorkingdayProfile() {

    }

    public canViewEmpBasic() {

    }

    public canViewAllEmployees() {

    }

    public canAccessHolidaysAndAbsence() {

    }
    public manageEmployeeGroup() {

    }

    public canViewEmpAdvance() {

    }

    public canViewEmpSensitive() {

    }

    public canManageNoEmailUsers() {

    }

    public canManageHolidayDelegation() {

    }

    public canPublishAtlasReports() {

    }

    public canDesignAtlasReports() {

    }

    public canManageEmployeeSensitiveDetails() {

    }

    public CanManageEmployeeAdvanceeDetails() {

    }
    public canAccessClientLibrary() {

    }
    public isHSServiceOwnerOrCoordinator() {

    }
    public canBulkResetPwd() {

    }

    public canManageCompanyOnBoarding() {

    }

    public CanManageExamples() {

    }

    public canViewCompanyAllTasks() {

    }

    public cancreateExampleProcedures() {

    }

    public canCreateExampleRiskAssessments() {

    }

    public hasRiskAssessments() {

    }

    public canFullAssignedToShown() {


    }

    public cancreateProcedures() {


    }

    public canViewHSDocuments() {


    }
    public canViewELDocuments() {


    }

    public canCreateContracts() {

    }
    public canCreateExampleChecklist() {

    }

    public canActionChecklist() {

    }
    public canCreateChecklist() {

    }
    public CanCreateExampleChecklist() {

    }

    public canBulkUpdateEmployees() {

    }
    public canExportEmployees() {

    }
    public canAddEmployees() {


    }

    public canAddTask() {

    }

    public canCreateExampleMS() {

    }

    public canApproveAndArchiveMethodStatements() {

    }
    public canManageMethodStatements() {

    }

    public getCompanySiteUrl() {

    }

    public canCopyRiskAssessmentToCompany() {

    }

    public canCopyRiskAssesmentAsAdmin() {

    }

    public canManageYearEndProcedure() {

    }

    public canAccessGroupFranchiseCompanies() {

    }

    public canAccessGroupCompanies() {

    }

    public IsPublicUser() {

    }

    public canCopyMethodStatementToCompany() {

    }

    public canViewAllCompanyIncidents() {

    }

    public canViewIncident() {

    }

    public canLogIncident() {

    }

    public canApproveIncident() {

    }

    public canUpdateIncident() {

    }

    public canUpdateAllCompanyIncidents() {

    }

    public canManageIncidents() {

    }

    public canHSConsultantViewIncidents() {

    }

    public CanViewAuditLog() {

    }

    public manageELDocuments() {

    }

    public manageHSDocuments() {

    }

    public canUpdateDocumentCategory() {

    }

}
