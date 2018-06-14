import { UpdateUserProfileInfoAction } from './../actions/user.actions';
import { Employee } from './../../employee/models/employee.model';
import { SystemTenantId } from './../app.constants';
import { RouteParams } from './../services/route-params';
import { CustomClaims } from './custom-claims';
import { StringHelper } from './string-helper';
import { Injectable } from '@angular/core';
import { JWTHelper } from './jwt-helper';
import { Store } from '@ngrx/store';
import * as fromRoot from '../reducers/index';
import { isNullOrUndefined } from 'util';

@Injectable()
export class ClaimsHelperService {
    private _claims: any;
    constructor(private _store: Store<fromRoot.State>, private _routeParams: RouteParams) {
        this._store.let(fromRoot.getUserIdentity).subscribe(userIdentity => {
            if (userIdentity.token)
                this._claims = JWTHelper.getDataFromToken(userIdentity.token);
        });
    }

    public SetUpdatedClaims(updatedClaims: Map<string, string>) {
        updatedClaims.forEach((value: string, key: string) => {
            if (!isNullOrUndefined(this._claims[key])) {
                this._claims[key] = value;
            }
        });
    }
    public TriggerToUpdatedClaimsFromEmpPersonal(updatedObject: Employee) {
        let preparedClaims: Map<string, string> = new Map<string, string>();
        preparedClaims.set('UserFirstName', updatedObject.FirstName);
        preparedClaims.set('UserLastName', updatedObject.Surname);
        preparedClaims.set('UserFullName', updatedObject.FullName);
        preparedClaims.set('EmpDOB', updatedObject.DOB.toString());
        this.SetUpdatedClaims(preparedClaims);
        this._store.dispatch(new UpdateUserProfileInfoAction(updatedObject));
    }
    get HasCid(): boolean {
        return this._routeParams.Cid ? true : false;
    }
    get IsCitationCid(): boolean {
        return (this._routeParams.Cid && (this._routeParams.Cid.toLowerCase() == SystemTenantId.toLowerCase()));
    }
    get IsCitationUser(): boolean {
        return (this.getCompanyId().toLowerCase() == SystemTenantId.toLowerCase());
    }

    get IsLoadExampleProfiles(): string {
        if ((this.IsCitationUser && !this.HasCid) || (this.IsCitationUser && this.HasCid && this.IsCitationCid)) {
            return 'false';  // for citation
        } else {
            return 'true';  //  for non citation
        }
    }

    public hasRole(name: string): boolean {
        if (!this._claims || !this._claims.role) return false;
        return (<string[]>(this._claims.role)).indexOf(name) >= 0;
    }
    public hasAnyRole(codes: string[]): boolean {
        if (!this._claims || !this._claims.role) return false;
        for (var i = 0, len = codes.length; i < len; i++) {
            if ((<string[]>(this._claims.role)).indexOf(codes[i]) >= 0) return true;
        }
        return false;
    }
    //region to assert all permission related conditions
    get canDistributeAnyDocument() {
        return this.hasAnyRole(
            [
                CustomClaims.CanAccessClientDocumentLibrary
                , CustomClaims.ViewHSDocuments
                , CustomClaims.ViewELDocuments
            ]
        )
    }
    get canDistributeAnySharedDocument() {
        return this.hasAnyRole(
            [
                , CustomClaims.CanViewELSharedDocuments
                , CustomClaims.CanViewHSSharedDocuments
            ]
        )
    }

    //end of region to assert all permission related conditions
    public getCompanyName(): string {
        return this._claims ? (this._claims.CompanyName.replace('\\’', '’')) : undefined;
    }

    public getCompanyCountryId(): string {
        return this._claims ? this._claims.CompanyCountryId : undefined;
    }
    public getCompanyId(): string {
        return this._claims ? this._claims.CompanyId : undefined;
    }

    public getCompanyIdOrCid(): string {
        return !isNullOrUndefined(this._routeParams.Cid) ? this._routeParams.Cid : this.getCompanyId();
    }

    public getCompanyStructureTypeId(): string {
        return this._claims ? this._claims.CompanyStructureTypeId : undefined;
    }
    public getEmpEmail(): string {
        return this._claims ? this._claims.EmpEmail : undefined;
    }
    public getEmpHomePhone(): string {
        return this._claims ? this._claims.EmpHomePhone : undefined;
    }
    public getEmpPictureUrl(): string {
        return this._claims && this._claims.EmpPictureUrl != "00000000-0000-0000-0000-000000000000" ? this._claims.EmpPictureUrl : undefined;
    }
    public getEmpId(): string {
        return this._claims ? this._claims.EmployeeId : undefined;
    }
    public getEmpIdOrDefault(): string {
        return (this._claims && this._claims.EmployeeId) ? this._claims.EmployeeId : "00000000-0000-0000-0000-000000000000";
    }
    public getIsDeligatedAuthorizor(): boolean {
        return this._claims ? StringHelper.coerceBooleanProperty(this._claims.IsDeligatedAuthorizor) : undefined;
    }
    public getParentCompanyId(): string {
        return this._claims ? this._claims.ParentCompanyId : undefined;
    }
    public getSectorId(): string {
        return this._claims ? this._claims.SectorId : undefined;
    }
    public getSectorName(): string {
        return this._claims ? this._claims.SectorName : undefined;
    }
    public getTenantName(): string {
        return this._claims ? this._claims.TenantName : undefined;
    }
    public getUserFullName(): string {
        return this._claims ? this._claims.UserFullName : undefined;
    }
    public getUserName(): string {
        return this._claims ? this._claims.UserName : undefined;
    }
    public getSiteId(): string {
        return this._claims && this._claims.SiteId ? this._claims.SiteId : "00000000-0000-0000-0000-000000000000";
    }
    public getDepartmentId(): string {
        return this._claims && this._claims.DepartmentId ? this._claims.DepartmentId : "00000000-0000-0000-0000-000000000000";
    }
    public getAdviceCardNumber(): string {
        return this._claims && this._claims.CardNumber ? this._claims.CardNumber : undefined;
    }
    public getEmpDOB(): string {
        return this._claims ? this._claims.EmpDOB : undefined;
    }
    public getUserId(): string {
        return this._claims ? this._claims.id : undefined;
    }
    public getUserFirstName(): string {
        return this._claims ? this._claims.UserFirstName : undefined;
    }
    public getUserLastName(): string {
        return this._claims ? this._claims.UserLastName : undefined;
    }

    public isEmployee(): boolean {
        return !this.isHRManagerOrServiceOwner() && this.hasRole('maembade');
    }
    public isHRManagerOrServiceOwner(): boolean {
        return this.hasRole(CustomClaims.CanManageEmployeeSensitiveDetails);
    }
    public isHolidayAuthorizerOrManager(): boolean {
        return this.hasRole(CustomClaims.IsHolidayAuthorisor);
    }
    public isAdministrator(): boolean {
        return this.hasRole(CustomClaims.CitationAdministrator);
    }
    public isConsultant(): boolean {
        return this.hasRole(CustomClaims.ELConsultant) || this.hasRole(CustomClaims.HSConsultant);
    }
    public isHSConsultant(): boolean {
        return this.hasRole(CustomClaims.HSConsultant);
    }
    public canManageCompany(): boolean {
        return this.hasRole(CustomClaims.ManageCompany);
    }
    public canViewOthersCalendar(): boolean {
        return this.hasRole(CustomClaims.CanViewOtherConsultantsCalendar);
    }
    //Adding decision level properties and these are fullfiiled when set method is called and is called after user is autohrized and when route 
    //is changed with cid then also this needs to be set or the base-layout component after Init this needs to be called which will satisfy direct routing from v1 to v2 too
    public canAddHolidayOnbehalf(): boolean {
        return this.hasRole(CustomClaims.CanAddOnbehalfHolidaysAndAbsence);
    }

    public canManageClientEmps(): boolean {
        return this.hasRole('maclem') && this.HasCid && !this.IsCitationCid
    }

    public canManageEmpProCat(): boolean {
        return this.hasRole(CustomClaims.ManageEmployeeProtectiveCategories);
    }

    public isHSOrELConsultant(): boolean {
        return this.hasAnyRole([CustomClaims.HSConsultant, CustomClaims.ELConsultant]);
    }

    public canViewDeptEmps(): boolean {
        return this.hasRole(CustomClaims.ViewDeparmentEmployees);
    }

    public canManageDeptEmps(): boolean {
        return this.hasRole(CustomClaims.ManageDepartmentEmployees);
    }

    public canManageEmpSensitive(): boolean {
        return this.hasRole(CustomClaims.CanManageEmployeeSensitiveDetails);
    }

    public canManageEmpAdvance(): boolean {
        return this.hasRole(CustomClaims.CanManageEmployeeAdvanceeDetails)
    }

    public canManageEmpBasic(): boolean {
        return this.hasRole(CustomClaims.CanManageEmployeeBasicDetails);
    }

    public canManagePredefinedWorkingdayProfile(): boolean {
        return this.hasRole(CustomClaims.ManagePredefinedWorkingProfiles);
    }

    public canViewEmpBasic(): boolean {
        return this.hasRole(CustomClaims.CanViewEmployeeBasicDetails);
    }

    public canViewAllEmployees(): boolean {
        return this.hasRole(CustomClaims.CanViewAllEmployees);
    }

    public canAccessHolidaysAndAbsence(): boolean {
        return this.hasRole(CustomClaims.AccessHolidayAbsence);
    }
    public manageEmployeeGroup(): boolean {
        return this.hasRole('maeldo') || this.hasRole('elco');
    }

    public canViewEmpAdvance(): boolean {
        return this.hasRole(CustomClaims.CanViewEmployeeAdvanceDetails);
    }

    public canViewEmpSensitive(): boolean {
        return this.hasRole(CustomClaims.CanViewEmployeeSensitiveDetails);
    }

    public canManageNoEmailUsers(): boolean {
        return this.hasRole(CustomClaims.CanManageNoEmailUsers) || ((this._routeParams.Cid && (this.hasRole(CustomClaims.ELConsultant) || this.hasRole(CustomClaims.HSConsultant))));
    }

    public canManageHolidayDelegation(): boolean {
        return this.hasRole(CustomClaims.CanManageHolidayDelegation);
    }

    public canPublishAtlasReports(): boolean {
        return this.hasRole('puatre');
    }

    public canDesignAtlasReports(): boolean {
        return this.hasRole('deatre');
    }

    public canManageEmployeeSensitiveDetails() {
        return this.hasRole(CustomClaims.CanManageEmployeeSensitiveDetails);
    }

    public CanManageEmployeeAdvanceeDetails() {
        return this.hasRole(CustomClaims.CanManageEmployeeAdvanceeDetails);
    }
    public canAccessClientLibrary() {
        return this.hasRole(CustomClaims.CanAccessClientDocumentLibrary);
    }
    public isHSServiceOwnerOrCoordinator() {
        return this.hasRole(CustomClaims.RiskAssessments);
    }
    public canBulkResetPwd(): boolean {
        return this.hasRole(CustomClaims.BulkResetPassword);
    }

    public canManageCompanyOnBoarding(): boolean {
        return this.hasRole(CustomClaims.ManageCompanyOnBoarding);
    }

    public CanManageExamples(): boolean {
        if ((this.IsCitationUser && !this.HasCid) || (this.IsCitationUser && this.HasCid && this.IsCitationCid)) {
            return true;
        } else {
            return false;
        }
    }

    public canViewCompanyAllTasks(): boolean {
        return this.hasRole(CustomClaims.ViewCompanyAllTasks);
    }

    public cancreateExampleProcedures(): boolean {
        return this.hasRole(CustomClaims.CanCreateExampleProcedure);
    }

    public canCreateExampleRiskAssessments(): boolean {
        return this.hasRole(CustomClaims.CanCreateExampleRiskAssessments);
    }

    public hasRiskAssessments(): boolean {
        return this.hasRole(CustomClaims.RiskAssessments);
    }

    public canFullAssignedToShown(): boolean {
        return this.hasRole(CustomClaims.CanViewAllEmployees) || (this.HasCid && (this.hasRole(CustomClaims.ELConsultant) || this.hasRole(CustomClaims.HSConsultant)));

    }

    public cancreateProcedures(): boolean {
        return this.hasRole(CustomClaims.CanCreateProcedure);

    }

    public canViewHSDocuments(): boolean {
        return this.hasRole(CustomClaims.ViewHSDocuments);

    }
    public canViewELDocuments(): boolean {
        return this.hasRole(CustomClaims.ViewELDocuments);

    }

    public canCreateContracts(): boolean {
        return this.hasRole(CustomClaims.CanCreateConracts);
    }
    public canCreateExampleChecklist(): boolean {
        return this.hasRole(CustomClaims.CanCreateExampleChecklist);
    }

    public canActionChecklist(): boolean {
        return this.hasRole(CustomClaims.CanActionChecklist);
    }
    public canCreateChecklist(): boolean {
        return this.hasRole(CustomClaims.CanCreateChecklist);
    }
    public CanCreateExampleChecklist(): boolean {
        return this.hasRole(CustomClaims.CanCreateExampleChecklist);
    }

    public canBulkUpdateEmployees(): boolean {
        return this.hasRole(CustomClaims.CitationAdministrator)
            || this.hasRole(CustomClaims.CanBulkUpdateEmployees)
            || (this.HasCid && this.hasRole(CustomClaims.ManageClientEmployees))
    }
    public canExportEmployees(): boolean {
        return this.hasRole(CustomClaims.CitationAdministrator)
            || this.hasRole(CustomClaims.CanViewAllEmployees)
            || (this.HasCid && this.hasRole(CustomClaims.ManageClientEmployees))
    }
    public canAddEmployees(): boolean {
        return this.hasRole(CustomClaims.CanAddEmployeeDetails) || this.canManageClientEmps();

    }

    public canAddTask(): boolean {
        return this.hasRole(CustomClaims.CanManageELTasks) || this.hasRole(CustomClaims.CanManageHSTasks) || this.hasRole(CustomClaims.CanManageAllTasks);
    }

    public canCreateExampleMS(): boolean {
        return ((this.hasRole(CustomClaims.CitationAdministrator)
            || this.hasRole(CustomClaims.canCreateExampleMS))
            && !(this.HasCid))
    }

    public canApproveAndArchiveMethodStatements(): boolean {
        return this.hasRole(CustomClaims.CanApproveAndArchiveMethodStatements);
    }
    public canManageMethodStatements(): boolean {
        return this.hasRole(CustomClaims.ManageMethodStatements);
    }

    public getCompanySiteUrl(): string {
        return this._claims ? this._claims.SiteUrl : undefined;
    }

    public canCopyRiskAssessmentToCompany(): boolean {
        return this.hasRole(CustomClaims.SystemAdministrator) || this.hasRole(CustomClaims.CitationAdministrator) || this.hasRole(CustomClaims.ELConsultant) || this.hasRole(CustomClaims.HSConsultant) || this.hasRole(CustomClaims.AccessGroupCompanies) || this.hasRole(CustomClaims.AccessGroupFranchiseCompanies);
    }

    public canCopyRiskAssesmentAsAdmin(): boolean {
        return (this.hasRole(CustomClaims.CitationAdministrator) || this.hasRole(CustomClaims.CanCreateExampleRiskAssessments)) && !this.HasCid;
    }

    public canManageYearEndProcedure(): boolean {
        return this.hasRole(CustomClaims.ManageCompanyYearEndProcedure);
    }

    public canAccessGroupFranchiseCompanies(): boolean {
        return this.hasRole(CustomClaims.AccessGroupFranchiseCompanies);
    }

    public canAccessGroupCompanies(): boolean {
        return this.hasAnyRole([CustomClaims.AccessGroupCompanies, CustomClaims.AccessGroupFranchiseCompanies]);
    }

    public IsPublicUser(): boolean {
        return this.hasRole(CustomClaims.PublicUserPermission) && !this.hasRole(CustomClaims.CanManageEmployeeBasicDetails);
    }

    public canCopyMethodStatementToCompany(): boolean {
        return this.hasRole(CustomClaims.SystemAdministrator) || this.hasRole(CustomClaims.CitationAdministrator) || this.hasRole(CustomClaims.ELConsultant) || this.hasRole(CustomClaims.HSConsultant) || this.hasRole(CustomClaims.AccessGroupCompanies) || this.hasRole(CustomClaims.AccessGroupFranchiseCompanies);
    }

    public canViewAllCompanyIncidents(): boolean {
        return this.hasRole(CustomClaims.viewAllCompanyIncidents);
    }

    public canViewIncident(): boolean {
        return this.hasRole(CustomClaims.viewIncident) || this.canHSConsultantViewIncidents();
    }

    public canLogIncident(): boolean {
        return this.hasRole(CustomClaims.logIncident);
    }

    public canApproveIncident(): boolean {
        return this.hasRole(CustomClaims.approvieIncident);
    }

    public canUpdateIncident(): boolean {
        return this.hasRole(CustomClaims.updateIncident);
    }

    public canUpdateAllCompanyIncidents(): boolean {
        return this.hasRole(CustomClaims.updateAllCompanyIncidents);
    }

    public canManageIncidents() {
        return this.hasRole(CustomClaims.mangeIncidents) && this.HasCid && !this.IsCitationCid;
    }

    public canHSConsultantViewIncidents() {
        return (this.HasCid && this.isHSConsultant() && !this.IsCitationCid);
    }

    public CanViewAuditLog(): boolean {
        return this.hasRole(CustomClaims.CanViewAuditLog);
    }

    public manageELDocuments(): boolean {
        return this.hasRole(CustomClaims.ManageELDocuments);
    }

    public manageHSDocuments(): boolean {
        return this.hasRole(CustomClaims.ManageHSDocuments);
    }

    public canUpdateDocumentCategory(): boolean {
        return this.hasRole(CustomClaims.CanUpdateDocumentCategory);
    }

    public hasHSContentAdministratorPermission() {
        return this.hasRole(CustomClaims.HSContentAdministrator);
    }

    public canViewUnassignedTasks(): boolean {
        return (this.isHSServiceOwnerOrCoordinator() || this.hasRole(CustomClaims.DistributeELDocuments));
    }
}
