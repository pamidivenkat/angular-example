import { ClaimsHelperService } from './claims-helper';
import { RouteParams } from './../services/route-params';



export class CustomClaims {

    static SystemAdministrator = "syad";
    static CitationAdministrator = "ciad";
    static ELConsultant = "elco";
    static HSConsultant = "hsco";
    static HR_SPECIALIST = "crco";


    static CanManageSharedDocuments = "camashdo";
    static CanCreateExampleRiskAssessments = "cacrexrias";
    static CanCreateExampleMethodStatements = "cacrexmest";
    static ViewAllCompanies = "vialco";
    static ManageCompanyStatus = "macost";
    static ManageCompanySites = "macosi";
    static CanAccessClientDocumentLibrary = "caclacdoli";
    static CanUpdateDocumentCategory = "caupdoca";

    static RiskAssessments = "rias";
    static CanViewOtherConsultantsCalendar = "CaViOtCo";
    static MinimumAccessRequired = "mireac";

    static ManageELDocuments = "maeldo";
    static ManageHSDocuments = "mahsdo";
    static DistributeHSDocuments = "dihsdo";
    static DistributeELDocuments = "dieldo";

    static CanArchiveHSDocuments = "cahsdo";
    static CanArchiveELDocuments = "caeldo";



    static CanManageHSSharedDocuments = "mahsshdo";
    static CanManageELSharedDocuments = "maelshdo";

    static CanViewHSSharedDocuments = "vihsshdo";
    static CanViewELSharedDocuments = "vielshdo";

    static CanManageNoEmailUsers = "manoemus";

    static ViewCompanyAllTasks = "vicoalta";

    static CanManageAllTasks = "mata";
    static CanManageELTasks = "maelta";
    static CanManageHSTasks = "mahsta";



    //#region Employee Permissions
    static CanAddEmployeeDetails = "caademde";
    static ManageEmployeeProtectiveCategories = "maemprca";

    static CanBulkUpdateEmployees = "cabuupemre";

    static CanViewEmployeeBasicDetails = "viembade";
    static CanViewEmployeeAdvanceDetails = "viemadde";
    static CanViewEmployeeSensitiveDetails = "viemsede";
    static CanManageEmployeeSensitiveDetails = "maemsede";
    static CanManageEmployeeAdvanceeDetails = "maemadde";
    static CanManageEmployeeBasicDetails = "maembade";

    //#endregion


    static AccessHolidayAbsence = "achoanab";

    static CanAddOnbehalfHolidaysAndAbsence = "caadhoabem";

    static ViewOtherEmployeeDocs = "viotemusdo";

    static ViewSensitiveDocs = "visedo";

    static AccessGroupCompanies = "acgrco";

    static CanViewAllEmployees = "cavialem";

    static IsHolidayAuthorisor = "ishoau";

    static CanManageHolidayDelegation = "camahode";

    static CanValidateCustomer = "cavacu";

    static AccessReggie = "atapacre";

    static CanAddAdhocEmployee = "caadadem";

    static CanTakeCompanyFeedback = "catacofe";

    static ManagePredefinedWorkingProfiles = "maprwopr";

    static ManageWorkingDaysProfiles = "mawodapro";


    static ManageEmployeeConfigurations = "maemco";

    static ManageCompany = "maco";

    static DistributeSharedDocuments = "dishdoc";

    static AccessFranchiseCompanies = "acfrco";

    static AccessGroupFranchiseCompanies = "acgrfrco";


    static ViewDeparmentEmployees = "videemp";

    static ManageDepartmentEmployees = "madeemp";

    static ELContentAdministrator = "elcoad";

    static CanViewDesignAtlasReports = "deatre";

    static HSContentAdministrator = "hscoad";

    static ManageMethodStatements = "mnms";

    static CanApproveAndArchiveMethodStatements = "caapms";

    static BulkResetPassword = "bupare";

    static CanCreateELComplianceCertificate = "cacrelcc";

    static CanCreateHSComplianceCertificate = "cacrhscc";

    static ManageCompanyOnBoarding = "macoon";

    static CanCreateProcedure = "cacrpro";

    static CanCreateExampleProcedure = "cacrexpr";

    static ViewELDocuments = "vieldo";

    static ViewHSDocuments = "vihsdo";

    static ManageCompanyYearEndProcedure = "mayepr";

    static DistributeELSharedDocuments = "dielshdo";

    static DistributeHSSharedDocuments = "dihsshdo";

    //#endregion


    //#region Checklist Permissions

    static CanCreateExampleChecklist = "cacrexch";
    static CanCreateChecklist = "cacrch";
    static CanActionChecklist = "caacch";

    //#endregion

    static CanViewAuditLog = "caviaulo";

    static ActivityContentAdministrator = "accoad";

    static OnboardingManager = "onma";

    static OnboardingTeam = "onte";


    static AccidentLog = "aclo";

    static ConstructionPhasePlans = "cophpl";

    static CanCreateConracts = "crco";

    static ManageClientEmployees = "maclem";

    //#Method statements Permission
    static canCreateExampleMS = "cacrexms";

    static PublicUserPermission = "puustrpe";


    //Accident log
    static viewAllCompanyIncidents = "vialcoin";
    static updateIncident = "upin";
    static viewIncident = "viin";
    static approvieIncident = "apin";
    static logIncident = "loin";
    static updateAllCompanyIncidents="upalcoin";
    static mangeIncidents="main";
}
