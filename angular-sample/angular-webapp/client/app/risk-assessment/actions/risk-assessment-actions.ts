import { RiskAssessmentControl } from '../models/risk-assessment-control';
import { AdditionalControlCategoryText } from '../models/additional-control-category-text';
import { RAAdditionalControl } from '../models/risk-assessment-additionalcontrols';
import { TaskActivity } from '../../task/models/task-activity';
import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { RiskAssessment } from '../models/risk-assessment';
import { AtlasApiRequestWithParams, AtlasParams, AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';
import { Document } from '../../document/models/document';
import * as Immutable from 'immutable';
import { RiskAssessmentHazard } from "../models/risk-assessment-hazard";
import { RASubstance } from "../models/risk-assessment-substance";
import { Hazard } from "../models/hazard";
import { User } from '../../shared/models/user';

export const ActionTypes = {
    LOAD_RISKASSESSMENTS: type('[RISKASSESSMENT] Load risk assessment list')
    , LOAD_RISKASSESSMENTS_COMPLETE: type('[RISKASSESSMENT] Load risk assessment list complete')
    , LOAD_RISKASSESSMENT_INFORMATION_COMPONENT: type('[RISKASSESSMENT] Load risk assessment information component')
    , LOAD_RISKASSESSMENT_INFORMATION_COMPONENT_COMPLETE: type('[RISKASSESSMENT] Load risk assessment information component complete')
    , LOAD_RISKASSESSMENT: type('[RISKASSESSMENT] Load risk assessment')
    , LOAD_RISKASSESSMENT_COMPLETE: type('[RISKASSESSMENT] Load risk assessment complete')
    , FILTER_BY_NAME_ACTION: type('[RISKASSESSMENT] Filter with name')
    , FILTER_BY_SITE_ACTION: type('[RISKASSESSMENT] Filter with site')
    , FILTER_BY_ASSESSMENT_TYPE_ACTION: type('[RISKASSESSMENT] Filter with assessment type')
    , FILTER_BY_WORKSPACE_ACTION: type('[RISKASSESSMENT] Filter with work space')
    , FILTER_BY_SECTOR_ACTION: type('[RISKASSESSMENT] Filter with sector')
    , LOAD_RISKASSESSMENT_MEASURES: type('[TaskActivity] Load risk assessment measures')
    , LOAD_RISKASSESSMENT_MEASURES_COMPLETE: type('[TaskActivity] Load risk assessment measures complete')
    , CREATE_RISKASSESSMENT: type('[RISKASSESSMENT] Create risk assessment')
    , CREATE_RISKASSESSMENT_COMPLETE: type('[RISKASSESSMENT] Create risk assessment complete')
    , UPDATE_RISKASSESSMENT: type('[RISKASSESSMENT] Update risk assessment')
    , UPDATE_RISKASSESSMENT_COMPLETE: type('[RISKASSESSMENT] Update risk assessment complete')
    , LOAD_ADDITIONAL_CONTROL_RISKASSESSMENT_LIST: type('[RISKASSESSMENT] Load additional controls risk assessment')
    , LOAD_ADDITIONAL_CONTROL_RISKASSESSMENT_LIST_COMPLETE: type('[RISKASSESSMENT] Load additional controls risk assessment list complete')
    , LOAD_ADDITIONAL_CONTROL_CATEGORY_TEXT: type('[RISKASSESSMENT] Load additional controls category text')
    , LOAD_ADDITIONAL_CONTROL_CATEGORY_TEXT_COMPLETE: type('[RISKASSESSMENT] Load additional controls category text complete')
    , LOAD_RA_ADDITIONAL_CONTROL_LIST: type('[RISKASSESSMENT] Load RA additional controls list')
    , LOAD_RA_ADDITIONAL_CONTROL_LIST_COMPLETE: type('[RISKASSESSMENT] Load RA additional controls list complete')
    , SAVE_ADDITIONAL_CONTROLS_LIST: type('[RISKASSESSMENT] save RA additional controls list ')
    , SAVE_ADDITIONAL_CONTROLS_LIST_COMPLETE: type('[RISKASSESSMENT] save RA additional controls list complete')
    , SAVE_ADDITIONAL_CONTROLS_TEXT: type('[RISKASSESSMENT] save RA additional controls text ')
    , SAVE_ADDITIONAL_CONTROLS_TEXT_COMPLETE: type('[RISKASSESSMENT] save RA additional controls text complete')
    , LOAD_HAZARDS: type('[RISKASSESSMENT] Load risk assessment hazards')
    , LOAD_EXAMPLE_HAZARDS: type('[RISKASSESSMENT] Load example risk assessment hazards')
    , LOAD_HAZARDS_COMPLETE: type('[RISKASSESSMENT] Load risk assessment hazards complete')
    , Load_SELECTED_HAZARDS: type('[RISKASSESSMENT] Load selected hazards')
    , Load_SELECTED_HAZARDS_COMPLETE: type('[RISKASSESSMENT] Load selected hazards complete')
    , REMOVE_DOCUMENT: type('[RISKASSESSMENT] Remove risk assessment document')
    , REMOVE_DOCUMENT_COMPLETE: type('[RISKASSESSMENT] Remove risk assessment document complete')
    , LOAD_RISKASSESSMENT_FILTER_DOCUMENTS: type('[RISKASSESSMENT] risk assessment filter documents')
    , LOAD_EXAMPLE_ROUTES_OF_EXPOSURE: type('[RISKASSESSMENT] Load example risk assessment routes of exposure')
    , LOAD_ROUTES_OF_EXPOSURE_COMPLETE: type('[RISKASSESSMENT] Load risk assessment routes of exposure complete')
    , LOAD_ROUTES_OF_EXPOSURE_BY_RISKASSESSMENT_ID: type('[RISKASSESSMENT] Load routes of exposure by risk assessment id')
    , LOAD_ROUTES_OF_EXPOSURE_BY_RISKASSESSMENT_ID_COMPLETE: type('[RISKASSESSMENT] Load routes of exposure by risk assessment id complete')
    , CREATE_RISKASSESSMENT_ROUTE_OF_EXPOSURE: type('[RiskAssessmentHazard] Create risk assessment route of exposure/hazard')
    , UPDATE_RISKASSESSMENT_ROUTE_OF_EXPOSURE: type('[RiskAssessmentHazard] Update risk assessment route of exposure/hazard')
    , REMOVE_RISKASSESSMENT_ROUTE_OF_EXPOSURE: type('[RiskAssessmentHazard] Remove risk assessment route of exposure/hazard')
    , FILTER_ROUTES_OF_EXPOSURE: type('[RISKASSESSMENT] Filter routes of exposure on search text')
    , DELETE_RISKASSESSMENT: type('[RISKASSESSMENT] Delete risk assessment')
    , DELETE_RISKASSESSMENT_COMPLETE: type('[RISKASSESSMENT] Delete risk assessment complete')
    , ARCHIVED_RISKASSESSMENT: type('[RISKASSESSMENT] Archived risk assessment')
    , ARCHIVED_RISKASSESSMENT_COMPLETE: type('[RISKASSESSMENT] Archived risk assessment complete')
    , APPROVE_RISKASSESSMENT: type('[RISKASSESSMENT] Approve risk assessment')
    , APPROVE_RISKASSESSMENT_COMPLETE: type('[RISKASSESSMENT] Approve risk assessment complete')
    , LOAD_RISKASSESSMENT_SUBSTANCES: type('[RISKASSESSMENT] Load risk assessment substances')
    , LOAD_RISKASSESSMENT_SUBSTANCES_COMPLETE: type('[RISKASSESSMENT] Load risk assessment substances complete')
    , LOAD_COSHHINVENTORY: type('[RISKASSESSMENT] Load risk assessment coshh inventory')
    , LOAD_COSHHINVENTORY_COMPLETE: type('[RISKASSESSMENT] Load risk assessment coshh inventory complete')
    , ADD_RASUBSTANCE: type('[RISKASSESSMENT] Risk assessment add substance')
    , ADD_RASUBSTANCE_COMPLETE: type('[RISKASSESSMENT] Risk assessment add substance complete')
    , UPDATE_RASUBSTANCE: type('[RISKASSESSMENT] Risk assessment update substance')
    , UPDATE_RASUBSTANCE_COMPLETE: type('[RISKASSESSMENT] Risk assessment update substance complete')
    , ADD_RACOSHINVENTORY: type('[RISKASSESSMENT] Risk assessment add coshh inventory')
    , ADD_RACOSHINVENTORY_COMPLETE: type('[RISKASSESSMENT] Risk assessment add coshh inventory complete')
    , PEOCEDURES_RISKASSESSMENT_CREATE: type('[RISKASSESSMENT] Create procedures risk assessment')
    , PEOCEDURES_RISKASSESSMENT_UPDATE: type('[RISKASSESSMENT] Update procedures risk assessment')
    , PEOCEDURES_RISKASSESSMENT_CREATE_UPDATE_COMPLETE: type('[RISKASSESSMENT] Update or create procedures risk assessment complete')
    , LOAD_RISKASSESSMENT_HAZARDS: type('[RiskAssessmentHazard] Load hazards of a risk assessment')
    , LOAD_RISKASSESSMENT_HAZARDS_COMPLETE: type('[RiskAssessmentHazard] Load hazards of a risk assessment complete')
    , CREATE_RISKASSESSMENT_HAZARD: type('[RISKASSESSMENT] Create risk assessment hazard')
    , UPDATE_RISKASSESSMENT_HAZARD: type('[RISKASSESSMENT] update risk assessment hazard')
    , CREATE_UPDATE_RISKASSESSMENT_HAZARD_COMPLETE: type('[RISKASSESSMENT] add/update risk assessment hazard complete')
    , REMOVE_HAZARD: type('[RISKASSESSMENT] Remove risk assessment hazard')
    , REMOVE_HAZARD_COMPLETE: type('[RISKASSESSMENT] Remove risk assessment hazard complete')
    , CREATE_HAZARD: type('[RISKASSESSMENT] create hazard')
    , SET_RISK_ASSESSMENT_NAME: type('[RISKASSESSMENT] Set risk assessment name')
    , LOAD_RISKASSESSMENT_TASKS: type('[RISKASSESSMENT] Load risk assessment tasks')
    , LOAD_RISKASSESSMENT_TASKS_COMPLETE: type('[RISKASSESSMENT] Load risk assessment tasks complete')
    , CREATE_RISKASSESSMENT_TASK: type('[RISKASSESSMENT] Create risk assessment task')
    , UPDATE_RISKASSESSMENT_TASK: type('[RISKASSESSMENT] Update risk assessment task')
    , UPDATE_RISKASSESSMENT_COMPLETE_TASK: type('[RISKASSESSMENT] Update risk assessment complete task')
    , REMOVE_RISKASSESSMENT_TASK: type('[RISKASSESSMENT] Remove risk assessment task')
    , LOAD_RISKASSESSMENT_TASK_BY_ID: type('[RISKASSESSMENT] Load risk assessment task by task id')
    , LOAD_RISKASSESSMENT_TASK_BY_ID_COMPLETE: type('[RISKASSESSMENT] Load risk assessment task by task id complete')
    , LOAD_RISKASSESSMENT_DOCUMENTS_PAGGING_RESULT: type('[RISKASSESSMENT] Load risk assessment documents by paging')
    , LOAD_RISKASSESSMENT_COUNT: type('[RISKASSESSMENT] Load risk assessment count')
    , LOAD_RISKASSESSMENT_COUNT_COMPLETE: type('[RISKASSESSMENT] Load risk assessment count complete')
    , SET_RISKASSESSMENT_TYPE: type('[RISKASSESSMENT] Set risk assessment type')
    , SET_INITIAL_STATE: type('[RISKASSESSMENT] Set initial state')
    , REMOVE_RASUBSTANCE: type('[RISKASSESSMENT] risk assessment remove substance')
    , REMOVE_RASUBSTANCE_COMPLETE: type('[RISKASSESSMENT] risk assessment remove substance complete')
    , EXPORT_RISKASSESSMENT_PREVIEW: type('[RISKASSESSMENT] risk assessment preview export')
    , EXPORT_RISKASSESSMENT_PREVIEW_COMPLETE: type('[RISKASSESSMENT] risk assessment preview export complete')
    , LOAD_RISKASSESSMENT_SUBSTANCE_PAGGING_RESULT: type('[RISKASSESSMENT] risk assessment substance paging')
    , LOAD_RISKASSESSMENT_SUBSTANCE_SORT_RESULT: type('[RISKASSESSMENT] risk assessment substance sorting')
    , COPY_RISKASSESSMENT: type('[RISKASSESSMENT] Copy risk assessment')
    , COPY_RISKASSESSMENT_COMPLETE: type('[RISKASSESSMENT] Copy risk assessment complete')
    , REVIEW_RISKASSESSMENT_ACTION: type('[RISKASSESSMENT] risk assessment review in progress')
    , REVIEW_RISKASSESSMENT_COMPLETE_ACTION: type('[RISKASSESSMENT] risk assessment review completed')
    , LOAD_FREQUENTLY_USED_CONTROLS: type('[RiskAssessmentControl] risk assessment frequently used controls load action')
    , LOAD_FREQUENTLY_USED_CONTROLS_COMPLETE: type('[RiskAssessmentControl] risk assessment frequently used controls load complete action')
    , LOAD_SUGGESTED_CONTROLS: type('[RiskAssessmentControl] risk assessment suggested controls load action')
    , LOAD_SUGGESTED_CONTROLS_COMPLETE: type('[RiskAssessmentControl] risk assessment suggested controls load complete action')
    , ADD_CONTROL: type('[RiskAssessmentControl] add risk control action')
    , ADD_CONTROL_COMPLETE: type('[RiskAssessmentControl] add risk control action complete')
    , REMOVE_CONTROL: type('[RiskAssessmentControl] remove risk control action')
    , REMOVE_CONTROL_COMPLETE: type('[RiskAssessmentControl] remove risk control action complete')
    , LOAD_ALL_CONTROLS: type('[RiskAssessmentControl] load example and company controls action')
    , LOAD_ALL_CONTROLS_COMPLETE: type('[Document] load example and company controls complete action')
    , CREATE_CONTROL: type('[RiskAssessmentControl] create new control')
    , CREATE_CONTROL_COMPLETE: type('[RiskAssessmentControl] create new control complete action')
    , UPDATE_RISK_ASSESSMENT_CONTROL: type('[RiskAssessmentControl] update risk assessment control action')
    , UPDATE_RISK_ASSESSMENT_CONTROL_COMPLETE: type('[RiskAssessmentControl] update risk assessment control complete action')
    , UPDATE_RA_PRINT_DESCRIPTION_STATUS: type('[RISKASSESSMENT] update risk assessment print description status action')
    , UPDATE_RA_PRINT_DESCRIPTION_STATUS_COMPLETE: type('[RISKASSESSMENT] update risk assessment print description status complete action')
    , LOAD_RA_HAZARD_CATEGORY_TEXT: type('[RaHazardCategoryText] load risk assessment hazard category text')
    , LOAD_RA_HAZARD_CATEGORY_TEXT_COMPLETE: type('[RaHazardCategoryText] load risk assessment hazard category text complete action')
    , CREATE_RA_HAZARD_CATEGORY_TEXT: type('[RaHazardCategoryText] create risk assessment hazard category text')
    , CREATE_RA_HAZARD_CATEGORY_TEXT_COMPLETE: type('[RaHazardCategoryText] create risk assessment hazard category text complete')
    , UPDATE_RA_HAZARD_CATEGORY_TEXT: type('[RaHazardCategoryText] update risk assessment hazard category text')
    , UPDATE_RA_HAZARD_CATEGORY_TEXT_COMPLETE: type('[RaHazardCategoryText] update risk assessment hazard category text complete')
    , LOAD_RA_CONTROLS_CATEGORY_TEXT: type('[RAControlsCategoryText] load risk assessment hazard category text')
    , LOAD_RA_CONTROLS_CATEGORY_TEXT_COMPLETE: type('[RAControlsCategoryText] load risk assessment hazard category text complete action')
    , CREATE_RA_CONTROLS_CATEGORY_TEXT: type('[RAControlsCategoryText] create risk assessment hazard category text')
    , CREATE_RA_CONTROLS_CATEGORY_TEXT_COMPLETE: type('[RAControlsCategoryText] create risk assessment hazard category text complete')
    , UPDATE_RA_CONTROLS_CATEGORY_TEXT: type('[RAControlsCategoryText] update risk assessment hazard category text')
    , UPDATE_RA_CONTROLS_CATEGORY_TEXT_COMPLETE: type('[RAControlsCategoryText] update risk assessment hazard category text complete')
}

export class LoadRiskAssessments implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENTS;
    constructor(public payload: AtlasApiRequestWithParams) {

    }
}

export class LoadRiskAssessmentsCompleteAction implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENTS_COMPLETE;
    constructor(public payload: any) {

    }
}

export class LoadRiskAssessmentsInformationComponentAction implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENT_INFORMATION_COMPONENT;
    constructor(public payload: string) {

    }
}

export class LoadRiskAssessmentsInformationComponentCompleteAction implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENT_INFORMATION_COMPONENT_COMPLETE;
    constructor(public payload: AeInformationBarItem[]) {

    }
}

export class LoadRiskAssessmentAction implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENT;
    constructor(public payload: any) {

    }
}

export class LoadRiskAssessmentCompleteAction implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENT_COMPLETE;
    constructor(public payload: RiskAssessment) {

    }
}


export class FilterByRiskAssessmentNameAction implements Action {
    type = ActionTypes.FILTER_BY_NAME_ACTION;
    constructor(public payload: string) {

    }
}
export class FilterByRiskAssessmentSiteAction implements Action {
    type = ActionTypes.FILTER_BY_SITE_ACTION;
    constructor(public payload: string) {

    }
}
export class CreateRiskAssessmentAction implements Action {
    type = ActionTypes.CREATE_RISKASSESSMENT;
    constructor(public payload: RiskAssessment) {

    }
}

export class CreateRiskAssessmentCompleteAction implements Action {
    type = ActionTypes.CREATE_RISKASSESSMENT_COMPLETE;
    constructor(public payload: RiskAssessment) {

    }
}


export class FilterByRiskAssessmentTypeAction implements Action {
    type = ActionTypes.FILTER_BY_ASSESSMENT_TYPE_ACTION;
    constructor(public payload: string) {

    }
}
export class FilterByRiskAssessmentWorkSpaceAction implements Action {
    type = ActionTypes.FILTER_BY_WORKSPACE_ACTION;
    constructor(public payload: string) {

    }
}

export class FilterByRiskAssessmentSectorAction implements Action {
    type = ActionTypes.FILTER_BY_SECTOR_ACTION;
    constructor(public payload: string) { }
}
export class UpdateRiskAssessmentAction implements Action {
    type = ActionTypes.UPDATE_RISKASSESSMENT;
    constructor(public payload: RiskAssessment) {

    }
}


export class UpdateRiskAssessmentCompleteAction implements Action {
    type = ActionTypes.UPDATE_RISKASSESSMENT_COMPLETE;
    constructor(public payload: RiskAssessment) {

    }
}
export class RemoveDocumentAction implements Action {
    type = ActionTypes.REMOVE_DOCUMENT;
    constructor(public payload: Document) {
    }
}

export class RemoveDocumentCompleteAction implements Action {
    type = ActionTypes.REMOVE_DOCUMENT_COMPLETE;
    constructor(public payload: boolean) {
    }
}

export class LoadExampleRoutesOfExposureAction implements Action {
    type = ActionTypes.LOAD_EXAMPLE_ROUTES_OF_EXPOSURE;
    constructor(public payload: any) {
    }
}
export class DeleteRiskAssessmentAction implements Action {
    type = ActionTypes.DELETE_RISKASSESSMENT;
    constructor(public payload: RiskAssessment) {

    }
}

export class LoadRoutesOfExposureCompleteAction implements Action {
    type = ActionTypes.LOAD_ROUTES_OF_EXPOSURE_COMPLETE;
    constructor(public payload: any) {

    }
}

export class LoadRoutesOfExposureByRiskAssessmentIdAction implements Action {
    type = ActionTypes.LOAD_ROUTES_OF_EXPOSURE_BY_RISKASSESSMENT_ID;
    constructor(public payload: any) {
    }
}
export class DeleteRiskAssessmentCompleteAction implements Action {
    type = ActionTypes.DELETE_RISKASSESSMENT_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class LoadRoutesOfExposureByRiskAssessmentIdCompleteAction implements Action {
    type = ActionTypes.LOAD_ROUTES_OF_EXPOSURE_BY_RISKASSESSMENT_ID_COMPLETE;
    constructor(public payload: any) {
    }
}
export class ArchivedRiskAssessmentAction implements Action {
    type = ActionTypes.ARCHIVED_RISKASSESSMENT;
    constructor(public payload: RiskAssessment) {

    }
}

export class CreateRiskAssessmentRouteOfExposureAction implements Action {
    type = ActionTypes.CREATE_RISKASSESSMENT_ROUTE_OF_EXPOSURE;
    constructor(public payload: any) {

    }
}

export class UpdateRiskAssessmentRouteOfExposureAction implements Action {
    type = ActionTypes.UPDATE_RISKASSESSMENT_ROUTE_OF_EXPOSURE;
    constructor(public payload: any) {
    }
}
export class ArchivedRiskAssessmentCompleteAction implements Action {
    type = ActionTypes.ARCHIVED_RISKASSESSMENT_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class RemoveRiskAssessmentRouteOfExposureAction implements Action {
    type = ActionTypes.REMOVE_RISKASSESSMENT_ROUTE_OF_EXPOSURE;
    constructor(public payload: any) {
    }
}
export class ApproveRiskAssessmentAction implements Action {
    type = ActionTypes.APPROVE_RISKASSESSMENT;
    constructor(public payload: RiskAssessment) {

    }
}

export class FilterRoutesOfExposureAction implements Action {
    type = ActionTypes.FILTER_ROUTES_OF_EXPOSURE;
    constructor(public payload: string) {
    }
}
export class ApproveRiskAssessmentCompleteAction implements Action {
    type = ActionTypes.APPROVE_RISKASSESSMENT_COMPLETE;
    constructor(public payload: boolean) {

    }
}


export class LoadRiskAssessmentMeasuresAction implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENT_MEASURES;
    constructor(public payload: any) {

    }
}

export class LoadRiskAssessmentMesauresCompleteAction implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENT_MEASURES_COMPLETE;
    constructor(public payload: TaskActivity) {

    }
}
export class LoadRiskAssessmentFilterDocumentsAction implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENT_FILTER_DOCUMENTS;
    constructor(public payload: any) {

    }
}

export class ProceduresRiskAssessmentCreateAction implements Action {
    type = ActionTypes.PEOCEDURES_RISKASSESSMENT_CREATE;
    constructor(public payload: any) {

    }
}
export class LoadRiskAssessmentSubstancesAction implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENT_SUBSTANCES;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadRiskAssessmentSubstancesCompleteAction implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENT_SUBSTANCES_COMPLETE;
    constructor(public payload: AtlasApiResponse<RASubstance>) {

    }
}

export class LoadCoshhInventory implements Action {
    type = ActionTypes.LOAD_COSHHINVENTORY;
    constructor(public payload: boolean) {
    }
}

export class LoadCoshhInventoryComplete implements Action {
    type = ActionTypes.LOAD_COSHHINVENTORY_COMPLETE;
    constructor(public payload: any) {
    }
}
export class AddRASubstanceAction implements Action {
    type = ActionTypes.ADD_RASUBSTANCE;
    constructor(public payload: RASubstance) {
    }
}

export class AddRASubstanceActionComplete implements Action {
    type = ActionTypes.ADD_RASUBSTANCE_COMPLETE;
    constructor(public payload: any) {
    }
}
export class UpdateRASubstanceAction implements Action {
    type = ActionTypes.UPDATE_RASUBSTANCE;
    constructor(public payload: RASubstance) {
    }
}

export class UpdateRASubstanceActionComplete implements Action {
    type = ActionTypes.UPDATE_RASUBSTANCE_COMPLETE;
    constructor(public payload: any) {
    }
}
export class AddRACoshhInventoryAction implements Action {
    type = ActionTypes.ADD_RACOSHINVENTORY;
    constructor(public payload: RASubstance) {
    }
}

export class AddRACoshhInventoryActionComplete implements Action {
    type = ActionTypes.ADD_RACOSHINVENTORY_COMPLETE;
    constructor(public payload: any) {
    }
}

export class ProceduresRiskAssessmentUpdateAction implements Action {
    type = ActionTypes.PEOCEDURES_RISKASSESSMENT_UPDATE;
    constructor(public payload: any) {

    }
}
export class ProceduresRiskAssessmentUpdateCompleteAction implements Action {
    type = ActionTypes.PEOCEDURES_RISKASSESSMENT_CREATE_UPDATE_COMPLETE
    constructor(public payload: any) {
    }
}

export class LoadRiskAssessmentHazardsAction implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENT_HAZARDS;
    constructor(public payload: any) {
    }
}

export class LoadHazardsAction implements Action {
    type = ActionTypes.LOAD_HAZARDS;
    constructor(public payload: any) {

    }
}

export class LoadExampleHazardsAction implements Action {
    type = ActionTypes.LOAD_EXAMPLE_HAZARDS;
    constructor(public payload: any) {

    }
}

export class LoadHazardsCompleteAction implements Action {
    type = ActionTypes.LOAD_HAZARDS_COMPLETE;
    constructor(public payload: any) {

    }
}

export class LoadSelectedHazardsAction implements Action {
    type = ActionTypes.Load_SELECTED_HAZARDS;
    constructor(public payload: any) {

    }
}


export class LoadSelectedHazardsCompleteAction implements Action {
    type = ActionTypes.Load_SELECTED_HAZARDS_COMPLETE;
    constructor(public payload: Array<RiskAssessmentHazard>) {

    }
}

export class CreateRiskAssessmentHazardAction implements Action {
    type = ActionTypes.CREATE_RISKASSESSMENT_HAZARD;
    constructor(public payload: RiskAssessmentHazard) {

    }
}


export class UpdateRiskAssessmentHazardAction implements Action {
    type = ActionTypes.UPDATE_RISKASSESSMENT_HAZARD;
    constructor(public payload: RiskAssessmentHazard) {

    }
}

export class CreateUpdateRiskAssessmentHazardCompleteAction implements Action {
    type = ActionTypes.CREATE_UPDATE_RISKASSESSMENT_HAZARD_COMPLETE;
    constructor(public payload: RiskAssessmentHazard) {

    }
}

export class RemoveRiskAssessmentHazardAction implements Action {
    type = ActionTypes.REMOVE_HAZARD;
    constructor(public payload: string) {

    }
}

export class RemoveRiskAssessmentHazardCompleteAction implements Action {
    type = ActionTypes.REMOVE_HAZARD_COMPLETE;
    constructor(public payload: string) {

    }
}

export class LoadRiskAssessmentHazardsCompleteAction implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENT_HAZARDS_COMPLETE;
    constructor(public payload: RiskAssessmentHazard) {
    }
}
export class CreateHazardAction implements Action {
    type = ActionTypes.CREATE_HAZARD;
    constructor(public payload: RiskAssessmentHazard) {

    }
}

export class LoadRiskAssessmentTasksAction implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENT_TASKS;
    constructor(public payload: AtlasApiRequestWithParams) {

    }
}

export class LoadRiskAssessmentTasksCompleteAction implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENT_TASKS_COMPLETE;
    constructor(public payload: Immutable.List<TaskActivity>) {

    }
}

export class CreateRiskAssessmentTaskAction implements Action {
    type = ActionTypes.CREATE_RISKASSESSMENT_TASK;
    constructor(public payload: any) {

    }
}

export class UpdateRiskAssessmentTaskAction implements Action {
    type = ActionTypes.UPDATE_RISKASSESSMENT_TASK;
    constructor(public payload: any) {

    }
}

export class UpdateRiskAssessmentCompleteTaskAction implements Action {
    type = ActionTypes.UPDATE_RISKASSESSMENT_COMPLETE_TASK
    constructor(public payload: any) {

    }
}

export class RemoveRiskAssessmentTaskAction implements Action {
    type = ActionTypes.REMOVE_RISKASSESSMENT_TASK;
    constructor(public payload: any) {

    }
}

export class LoadRiskAssessmentTaskByIdAction implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENT_TASK_BY_ID;
    constructor(public payload: string) {

    }
}

export class LoadRiskAssessmentTaskByIdCompleteAction implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENT_TASK_BY_ID_COMPLETE;
    constructor(public payload: TaskActivity) {

    }
}

export class LoadAdditionalControlsRiskAssessmentsListAction implements Action {
    type = ActionTypes.LOAD_ADDITIONAL_CONTROL_RISKASSESSMENT_LIST;
    constructor(public payload: boolean) {

    }
}

export class LoadAdditionalControlsRiskAssessmentsListCompleteAction implements Action {
    type = ActionTypes.LOAD_ADDITIONAL_CONTROL_RISKASSESSMENT_LIST_COMPLETE;
    constructor(public payload: RAAdditionalControl) {

    }
}
export class LoadAdditionalControlsCategoryTextAction implements Action {
    type = ActionTypes.LOAD_ADDITIONAL_CONTROL_CATEGORY_TEXT;
    constructor(public payload: string) {

    }
}

export class LoadAdditionalControlsCategoryTextCompleteAction implements Action {
    type = ActionTypes.LOAD_ADDITIONAL_CONTROL_CATEGORY_TEXT_COMPLETE;
    constructor(public payload: any) {

    }
}
export class LoadRAAdditionalControlsListAction implements Action {
    type = ActionTypes.LOAD_RA_ADDITIONAL_CONTROL_LIST;
    constructor(public payload: string) {
    }
}

export class LoadRAAdditionalControlsListCompleteAction implements Action {
    type = ActionTypes.LOAD_RA_ADDITIONAL_CONTROL_LIST_COMPLETE;
    constructor(public payload: RAAdditionalControl) {
    }
}

export class SaveRAAdditionalControlsListAction implements Action {
    type = ActionTypes.SAVE_ADDITIONAL_CONTROLS_LIST;
    constructor(public payload: Array<RAAdditionalControl>) {
    }
}

export class SaveRAAdditionalControlsListCompleteAction implements Action {
    type = ActionTypes.SAVE_ADDITIONAL_CONTROLS_LIST_COMPLETE;
    constructor(public payload: Array<RAAdditionalControl>) {

    }
}
export class SaveRAAdditionalControlsTextAction implements Action {
    type = ActionTypes.SAVE_ADDITIONAL_CONTROLS_TEXT;
    constructor(public payload: Array<AdditionalControlCategoryText>) {

    }
}

export class SaveRAAdditionalControlsTextCompleteAction implements Action {
    type = ActionTypes.SAVE_ADDITIONAL_CONTROLS_TEXT_COMPLETE;
    constructor(public payload: Array<AdditionalControlCategoryText>) {
    }
}
//LoadRiskAssessmentHazardsCompleteAction

export class LoadRiskAssessmentDocumentsPaggingAction implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENT_DOCUMENTS_PAGGING_RESULT;
    constructor(public payload: any) {

    }
}
export class LoadRiskAssessmentSubstancePaggingAction implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENT_SUBSTANCE_PAGGING_RESULT;
    constructor(public payload: any) {

    }
}
export class LoadRiskAssessmentSubstanceSortAction implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENT_SUBSTANCE_SORT_RESULT;
    constructor(public payload: any) {

    }
}

export class SetRiskAssessmentNameAction implements Action {
    type = ActionTypes.SET_RISK_ASSESSMENT_NAME;
    constructor(public payload: string) {
    }
}
export class LoadRiskAssessmentsCount implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENT_COUNT;
    constructor(public payload: any) {

    }
}

export class LoadRiskAssessmentsCountComplete implements Action {
    type = ActionTypes.LOAD_RISKASSESSMENT_COUNT_COMPLETE;
    constructor(public payload: any) {

    }
}
export class SetRiskAssessmentTypeAction implements Action {
    type = ActionTypes.SET_RISKASSESSMENT_TYPE;
    constructor(public payload: string) {

    }
}

export class SetInitialState implements Action {
    type = ActionTypes.SET_INITIAL_STATE;
    constructor(public payload: string) {

    }
}

export class RemoveRASubstanceAction implements Action {
    type = ActionTypes.REMOVE_RASUBSTANCE;
    constructor(public payload: string) {
    }
}

export class RemoveRASubstanceActionComplete implements Action {
    type = ActionTypes.REMOVE_RASUBSTANCE_COMPLETE;
    constructor(public payload: any) {
    }
}
export class ReviewRiskAssessmentAction implements Action {
    type = ActionTypes.REVIEW_RISKASSESSMENT_ACTION;
    constructor(public payload: Array<any>) {
    }
}

export class CopyRiskAssessmentAction implements Action {
    type = ActionTypes.COPY_RISKASSESSMENT;
    constructor(public payload: RiskAssessment) {

    }
}

export class CopyRiskAssessmentCompleteAction implements Action {
    type = ActionTypes.COPY_RISKASSESSMENT_COMPLETE;
    constructor(public payload: RiskAssessment) {
    }
}

export class ExportRiskAssessmentsPreviewAction implements Action {
    type = ActionTypes.EXPORT_RISKASSESSMENT_PREVIEW;
    constructor(public payload: any) {
    }
}

export class ExportRiskAssessmentsPreviewActionComplete implements Action {
    type = ActionTypes.EXPORT_RISKASSESSMENT_PREVIEW_COMPLETE;
    constructor(public payload: any) {
    }
}

export class ReviewRiskAssessmentCompleteAction implements Action {
    type = ActionTypes.REVIEW_RISKASSESSMENT_COMPLETE_ACTION;
    constructor(public payload: any) {
    }
}
export class LoadFrequentlyUsedControls implements Action {
    type = ActionTypes.LOAD_FREQUENTLY_USED_CONTROLS;
    constructor(public payload: any) {

    }
}

export class LoadFrequentlyUsedControlsComplete implements Action {
    type = ActionTypes.LOAD_FREQUENTLY_USED_CONTROLS_COMPLETE;
    constructor(public payload: RiskAssessmentControl[]) {

    }
}

export class LoadSuggestedControls implements Action {
    type = ActionTypes.LOAD_SUGGESTED_CONTROLS;
    constructor(public payload: any) {

    }
}

export class LoadSuggestedControlsComplete implements Action {
    type = ActionTypes.LOAD_SUGGESTED_CONTROLS_COMPLETE;
    constructor(public payload: RiskAssessmentControl[]) {

    }
}

export class AddControl implements Action {
    type = ActionTypes.ADD_CONTROL;
    constructor(public payload: RiskAssessmentControl) {

    }
}

export class AddControlComplete implements Action {
    type = ActionTypes.ADD_CONTROL_COMPLETE;
    constructor(public payload: RiskAssessmentControl) {

    }
}

export class RemoveControl implements Action {
    type = ActionTypes.REMOVE_CONTROL
    constructor(public payload: RiskAssessmentControl) {

    }
}

export class RemoveControlComplete implements Action {
    type = ActionTypes.REMOVE_CONTROL_COMPLETE;
    constructor(public payload: any) {

    }
}

export class LoadAllControls implements Action {
    type = ActionTypes.LOAD_ALL_CONTROLS;
    constructor(public payload: AtlasApiRequestWithParams) {

    }
}

export class LoadAllControlsComplete implements Action {
    type = ActionTypes.LOAD_ALL_CONTROLS_COMPLETE;
    constructor(public payload: any) {

    }
}


export class CreateControlAction implements Action {
    type = ActionTypes.CREATE_CONTROL;
    constructor(public payload: any) {

    }
}

export class CreateControlCompleteAction implements Action {
    type = ActionTypes.CREATE_CONTROL_COMPLETE;
    constructor(public payload: any) {

    }
}

export class UpdateRiskAssessmentControlAction implements Action {
    type = ActionTypes.UPDATE_RISK_ASSESSMENT_CONTROL;
    constructor(public payload: RiskAssessmentControl) {

    }
}

export class UpdateRiskAssessmentControlCompleteAction implements Action {
    type = ActionTypes.UPDATE_RISK_ASSESSMENT_CONTROL_COMPLETE;
    constructor(public payload: RiskAssessmentControl) {

    }
}

export class UpdateRAPrintDescriptionStatusAction implements Action {
    type = ActionTypes.UPDATE_RA_PRINT_DESCRIPTION_STATUS;
    constructor(public payload: any) {

    }
}

export class UpdateRAPrintDescriptionStatusCompleteAction implements Action {
    type = ActionTypes.UPDATE_RA_PRINT_DESCRIPTION_STATUS_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class LoadRaHazardCategoryText implements Action {
    type = ActionTypes.LOAD_RA_HAZARD_CATEGORY_TEXT;
    constructor(public payload: any) {

    }
}

export class LoadRaHazardCategoryTextComplete implements Action {
    type = ActionTypes.LOAD_RA_HAZARD_CATEGORY_TEXT_COMPLETE;
    constructor(public payload: RiskAssessmentControl) {

    }
}

export class CreateRaHazardCategoryText implements Action {
    type = ActionTypes.CREATE_RA_HAZARD_CATEGORY_TEXT;
    constructor(public payload: any) {

    }
}

export class CreateRaHazardCategoryTextComplete implements Action {
    type = ActionTypes.CREATE_RA_HAZARD_CATEGORY_TEXT_COMPLETE;
    constructor(public payload: any) {

    }
}

export class UpdateRaHazardCategoryText implements Action {
    type = ActionTypes.UPDATE_RA_HAZARD_CATEGORY_TEXT
    constructor(public payload: any) {

    }
}

export class UpdateRaHazardCategoryTextComplete implements Action {
    type = ActionTypes.UPDATE_RA_HAZARD_CATEGORY_TEXT_COMPLETE;
    constructor(public payload: any) {

    }
}

export class LoadRaControlsCategoryText implements Action {
    type = ActionTypes.LOAD_RA_CONTROLS_CATEGORY_TEXT;
    constructor(public payload: any) {

    }
}

export class LoadRaControlsCategoryTextComplete implements Action {
    type = ActionTypes.LOAD_RA_CONTROLS_CATEGORY_TEXT_COMPLETE;
    constructor(public payload: RiskAssessmentControl) {

    }
}

export class CreateRaControlsCategoryText implements Action {
    type = ActionTypes.CREATE_RA_CONTROLS_CATEGORY_TEXT;
    constructor(public payload: any) {

    }
}

export class CreateRaControlsCategoryTextComplete implements Action {
    type = ActionTypes.CREATE_RA_CONTROLS_CATEGORY_TEXT_COMPLETE;
    constructor(public payload: any) {

    }
}

export class UpdateRaControlsCategoryText implements Action {
    type = ActionTypes.UPDATE_RA_CONTROLS_CATEGORY_TEXT;
    constructor(public payload: any) {

    }
}

export class UpdateRaControlsCategoryTextComplete implements Action {
    type = ActionTypes.UPDATE_RA_CONTROLS_CATEGORY_TEXT_COMPLETE
    constructor(public payload: any) {

    }
}

export type Actions =
    SetInitialState
    | LoadRaControlsCategoryText | LoadRaControlsCategoryTextComplete
    | CreateRaControlsCategoryText | CreateRaControlsCategoryTextComplete
    | UpdateRaControlsCategoryText | UpdateRaControlsCategoryTextComplete
    | CreateRaHazardCategoryText | CreateRaHazardCategoryTextComplete
    | LoadRaHazardCategoryText | LoadRaHazardCategoryTextComplete
    | CreateControlAction | CreateControlCompleteAction
    | UpdateRiskAssessmentControlAction | UpdateRiskAssessmentControlCompleteAction
    | LoadAllControls | LoadAllControlsComplete
    | RemoveControl | RemoveControlComplete
    | AddControl | AddControlComplete
    | LoadSuggestedControls | LoadSuggestedControlsComplete
    | LoadFrequentlyUsedControls | LoadFrequentlyUsedControlsComplete
    | LoadRiskAssessmentsInformationComponentAction | LoadRiskAssessmentsInformationComponentCompleteAction
    | LoadRiskAssessments | LoadRiskAssessmentsCompleteAction
    | LoadRiskAssessmentAction | LoadRiskAssessmentCompleteAction
    | LoadExampleRoutesOfExposureAction
    | LoadRoutesOfExposureCompleteAction
    | LoadRoutesOfExposureByRiskAssessmentIdAction
    | LoadRoutesOfExposureByRiskAssessmentIdCompleteAction
    | CreateRiskAssessmentRouteOfExposureAction
    | UpdateRiskAssessmentRouteOfExposureAction
    | RemoveRiskAssessmentRouteOfExposureAction
    | FilterRoutesOfExposureAction
    | CreateRiskAssessmentAction | CreateRiskAssessmentCompleteAction
    | UpdateRiskAssessmentAction | UpdateRiskAssessmentCompleteAction
    | LoadRiskAssessmentMeasuresAction | LoadRiskAssessmentMesauresCompleteAction
    | LoadAdditionalControlsRiskAssessmentsListAction | LoadAdditionalControlsRiskAssessmentsListCompleteAction
    | LoadAdditionalControlsCategoryTextAction | LoadAdditionalControlsCategoryTextCompleteAction
    | SaveRAAdditionalControlsListAction | SaveRAAdditionalControlsListCompleteAction
    | SaveRAAdditionalControlsTextAction | SaveRAAdditionalControlsTextCompleteAction
    | RemoveDocumentAction | RemoveDocumentCompleteAction
    | FilterByRiskAssessmentNameAction
    | FilterByRiskAssessmentSiteAction
    | FilterByRiskAssessmentTypeAction
    | FilterByRiskAssessmentWorkSpaceAction
    | FilterByRiskAssessmentSectorAction
    | DeleteRiskAssessmentAction | DeleteRiskAssessmentCompleteAction
    | ArchivedRiskAssessmentAction | ArchivedRiskAssessmentCompleteAction
    | ApproveRiskAssessmentAction | ApproveRiskAssessmentCompleteAction
    | LoadHazardsAction | LoadExampleHazardsAction | LoadHazardsCompleteAction
    | CreateRiskAssessmentHazardAction | UpdateRiskAssessmentHazardAction | CreateUpdateRiskAssessmentHazardCompleteAction
    | RemoveRiskAssessmentHazardAction | RemoveRiskAssessmentHazardCompleteAction
    | LoadRiskAssessmentMeasuresAction | LoadRiskAssessmentMesauresCompleteAction
    | LoadRiskAssessmentHazardsAction | LoadRiskAssessmentHazardsCompleteAction
    | LoadRiskAssessmentTasksAction | LoadRiskAssessmentTasksCompleteAction
    | CreateRiskAssessmentTaskAction
    | UpdateRiskAssessmentTaskAction
    | RemoveRiskAssessmentTaskAction
    | LoadRiskAssessmentTaskByIdAction | LoadRiskAssessmentTaskByIdCompleteAction
    | LoadRiskAssessmentHazardsAction | LoadRiskAssessmentHazardsCompleteAction
    | LoadRiskAssessmentSubstancesAction | LoadRiskAssessmentSubstancesCompleteAction
    | LoadCoshhInventory | LoadCoshhInventoryComplete
    | AddRASubstanceAction | AddRASubstanceActionComplete
    | UpdateRASubstanceAction | UpdateRASubstanceActionComplete
    | LoadRiskAssessmentDocumentsPaggingAction
    | AddRACoshhInventoryAction | AddRACoshhInventoryActionComplete
    | RemoveRiskAssessmentHazardAction | RemoveRiskAssessmentHazardCompleteAction
    | CreateHazardAction
    | LoadRiskAssessmentsCount | LoadRiskAssessmentsCountComplete
    | SetRiskAssessmentTypeAction | SetRiskAssessmentNameAction
    | RemoveRASubstanceAction | RemoveRASubstanceActionComplete
    | CopyRiskAssessmentAction | CopyRiskAssessmentCompleteAction
    | ExportRiskAssessmentsPreviewAction | ExportRiskAssessmentsPreviewActionComplete
    | UpdateRAPrintDescriptionStatusAction | UpdateRAPrintDescriptionStatusCompleteAction
    | ReviewRiskAssessmentAction | ReviewRiskAssessmentCompleteAction;

