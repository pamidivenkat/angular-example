import * as fromRoot from './reducers/index'
import { environment } from './../../environments/environment';

export const appUrl = environment.appUrl;
export const stsURL = environment.stsURL;
export const apiUrl = environment.apiUrl;
export const v1AppUrl = environment.v1AppUrl;
export const offlineAppUrl = environment.offlineAppURL;
export const defaultImage = "/assets/images/profile-default.png";
export const secureCookies = environment.secureCookies;
export const production = environment.production;
export const nonauth = environment.nonauth;
export const emptyGuid = '00000000-0000-0000-0000-000000000000';
export const SystemTenantId = '89504E36-557B-4691-8F1B-7E86F9CF95EA';
export const requestedAbsenceStatusId = '684d8b73-1164-4b0f-adcb-b65aa9b67216';
export const approvedAbsenceStatusId = '2B5B7BF4-4115-4179-A9FE-90068D183EC7';
export const reportingURL = environment.reportingURL;
export const wizardURL = environment.wizardURl;
export const otherEmploymentTypeId = 'e7950e8e-8e08-4e2f-a7ee-2bdbf045a13c';
export const trainingTaskCategoryId = 'dea7cf6e-6921-42dc-93cd-d65774a19f71';
export const generalRiskAssessmentTypeId = "07d70e9c-cf12-4b98-bb8e-27abaf654634";
export const coshhRiskAssessmentTypeId = "edf15228-1bb6-4623-af70-af613cda3a1f";
export const generalMigratedRiskAssessmentTypeId = "2a6fd11d-3a93-4abd-91d8-106b18d48cc0";
export const coshhMigratedRiskAssessmentTypeId = "22617d91-c3c6-420a-b94c-6cdcab026785";
export const defaultStandardPictureId = "01a94dd4-48fb-415e-831c-810ba898ebbc";
export const riskAssessmentTaskCategoryName: string = 'risk assessment';