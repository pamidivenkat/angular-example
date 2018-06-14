import { Action } from '@ngrx/store';
import * as Immutable from 'immutable';
import { Observable } from 'rxjs/Observable';
import { isNullOrUndefined } from 'util';

import { DataTableOptions } from '../../atlas-elements/common/models/ae-datatable-options';
import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { Document } from '../../document/models/document';
import * as fromConstants from '../../shared/app.constants';
import { AtlasApiRequestWithParams } from '../../shared/models/atlas-api-response';
import { TaskActivity } from '../../task/models/task-activity';
import * as riskAssessmentActions from '../actions/risk-assessment-actions';
import { ControlsCategory } from '../common/controls-category-enum';
import {
    extractActiveItems,
    extractActiveItemsByCategory,
    extractControlsByGroup,
    extractDataTableOptions,
    extractDocumentPagingDataTableOptions,
    extractDocuments,
    extractDocumentsLength,
    extractDocumentsWithPagging,
    extractRACoshhInventoryToAeSelectItems,
    extractSubstanceWithPagging,
    getCategory,
    getHazardsCount,
    getSelectedHazaradCount,
    getSelectedHazarads,
    extractAllControlsResponse,
    extractAllHazardsResponse,
} from '../common/extract-helper';
import { HazardCategory } from '../common/hazard-category-enum';
import { AdditionalControlCategoryText } from '../models/additional-control-category-text';
import { Hazard } from '../models/hazard';
import { RAControlsCategoryText } from '../models/ra-controls-category-text';
import { RAHazardCategoryText } from '../models/ra-hazard-category-text';
import { RiskAssessment } from '../models/risk-assessment';
import { RAAdditionalControl } from '../models/risk-assessment-additionalcontrols';
import { RiskAssessmentControl } from '../models/risk-assessment-control';
import { RACoshhInventory } from '../models/risk-assessment-coshh-inventory';
import { RiskAssessmentHazard } from '../models/risk-assessment-hazard';
import { RASubstance } from '../models/risk-assessment-substance';

export interface RiskAssessmentState {
    loading: boolean;
    riskAssessmentList: Immutable.List<RiskAssessment>;
    riskAssessmentTotalCount: number;
    apiRequestWithParams: AtlasApiRequestWithParams;
    currentRiskAssessment: RiskAssessment;
    nameFilter: string;
    siteFilter: string;
    assessmentTypeFilter: string;
    workspaceFilter: string;
    sectorFilter: string;
    riskAssessmentInformationItems: AeInformationBarItem[];
    riskAssessmentAddUpdateComplete: boolean;
    additionalControlsRiskAssessmentsList: RAAdditionalControl[];
    HazardsList: Immutable.List<Hazard>;
    exampleHazardsList: Immutable.List<Hazard>;
    totalHazardsCount: number;
    totalExampleHazardsCount: number;
    currentRiskAssessmentDocuments: Immutable.List<Document>;
    currentRiskAssessmentDocumentsPagedData: Immutable.List<Document>;
    currentRiskAssessmentSubstances: Immutable.List<RASubstance>;
    currentRiskAssessmentCoshhInventory: RACoshhInventory[];
    currentRiskAssessmentSubstancesPagingInfo: PagingInfo;
    currentRiskAssessmentDocumentPagingInfo: DataTableOptions;
    currentRiskAssessmentSubstancesCount: number;
    currentRiskAssessmentDocumentCount: number;
    riskAssessmentHazardsList: Immutable.List<RiskAssessmentHazard>;
    exampleRiskAssessmentHazardsList: Immutable.List<RiskAssessmentHazard>;
    riskAssessmentRoutesOfExposureList: Immutable.List<RiskAssessmentHazard>;
    filteredRiskAssessmentRoutesOfExposureList: Immutable.List<RiskAssessmentHazard>;
    hazardsLoading: boolean;
    tasksListTotalCount: number;
    tasksListPagingInfo: PagingInfo;
    tasksListApiRequest: AtlasApiRequestWithParams;
    selectedRATask: TaskActivity;
    riskAssessmentName: string;
    riskAssessmentsCountByStatus: Map<string, number>;
    riskAssessmentTypeId: string;
    riskAssessmentDocument: Document;
    frequentlyUsedControls: RiskAssessmentControl[];
    suggestedControls: RiskAssessmentControl[];
    allControlsList: Immutable.List<RiskAssessmentControl>;
    allControlsCount: number;
    raChangeStatus: boolean;
    raHazardCategoryText: RAHazardCategoryText[];
    raControlsCategoryText: RAControlsCategoryText[];
    allHazardsLoading: boolean;
    allControlsLoading: boolean;
}

const initialState: RiskAssessmentState = {
    loading: false,
    riskAssessmentList: null,
    riskAssessmentTotalCount: null,
    apiRequestWithParams: null,
    currentRiskAssessment: null,
    riskAssessmentInformationItems: null,
    riskAssessmentAddUpdateComplete: false,
    additionalControlsRiskAssessmentsList: null,
    currentRiskAssessmentDocuments: null,
    currentRiskAssessmentDocumentsPagedData: null,
    currentRiskAssessmentSubstances: null,
    currentRiskAssessmentCoshhInventory: null,
    currentRiskAssessmentSubstancesPagingInfo: null,
    currentRiskAssessmentDocumentPagingInfo: null,
    currentRiskAssessmentSubstancesCount: null,
    currentRiskAssessmentDocumentCount: 0,
    riskAssessmentHazardsList: null,
    exampleRiskAssessmentHazardsList: null,
    riskAssessmentRoutesOfExposureList: null,
    filteredRiskAssessmentRoutesOfExposureList: null,
    nameFilter: null,
    siteFilter: null,
    assessmentTypeFilter: null,
    workspaceFilter: null,
    sectorFilter: null,
    HazardsList: null,
    exampleHazardsList: null,
    totalHazardsCount: null,
    totalExampleHazardsCount: 0,
    hazardsLoading: false,
    tasksListTotalCount: null,
    tasksListPagingInfo: null,
    tasksListApiRequest: null,
    selectedRATask: null,
    riskAssessmentName: null,
    riskAssessmentsCountByStatus: null,
    riskAssessmentTypeId: null,
    riskAssessmentDocument: null,
    raChangeStatus: null
    , frequentlyUsedControls: null
    , suggestedControls: null
    , allControlsList: null
    , allControlsCount: 0
    , raHazardCategoryText: null
    , raControlsCategoryText: null
    , allHazardsLoading: false
    , allControlsLoading: false
}

export function reducer(state = initialState, action: Action): RiskAssessmentState {
    switch (action.type) {
        case riskAssessmentActions.ActionTypes.SET_INITIAL_STATE: {
            let modifiedState = Object.assign(state, initialState);
            return modifiedState;
        }
        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_INFORMATION_COMPONENT:
            {
                return Object.assign({}, state, {});
            }
        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_INFORMATION_COMPONENT_COMPLETE:
            {
                return Object.assign({}, state, { riskAssessmentInformationItems: action.payload });
            }

        case riskAssessmentActions.ActionTypes.FILTER_BY_NAME_ACTION:
            {
                return Object.assign({}, state, { nameFilter: action.payload });
            }
        case riskAssessmentActions.ActionTypes.FILTER_BY_SITE_ACTION:
            {
                return Object.assign({}, state, { siteFilter: action.payload });
            }
        case riskAssessmentActions.ActionTypes.FILTER_BY_ASSESSMENT_TYPE_ACTION:
            {
                return Object.assign({}, state, { assessmentTypeFilter: action.payload });
            }

        case riskAssessmentActions.ActionTypes.FILTER_BY_WORKSPACE_ACTION:
            {
                return Object.assign({}, state, { workspaceFilter: action.payload });
            }

        case riskAssessmentActions.ActionTypes.FILTER_BY_SECTOR_ACTION:
            {
                return Object.assign({}, state, { sectorFilter: action.payload });
            }

        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENTS:
            {
                return Object.assign({}, state, { loading: true, apiRequestWithParams: action.payload });
            }

        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENTS_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(modifiedState.apiRequestWithParams)) {
                    if (action.payload.PagingInfo.PageNumber == 1) {
                        modifiedState.riskAssessmentTotalCount = action.payload.PagingInfo.TotalCount;
                    }
                }

                return Object.assign({}, modifiedState, { riskAssessmentList: action.payload.RiskAssessmentList, loading: false });
            }
        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_SUBSTANCES:
            {
                return Object.assign({}, state, { loading: true, apiRequestWithParams: action.payload });
            }

        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_SUBSTANCES_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, { currentRiskAssessmentSubstances: action.payload.Entities });
                if (!isNullOrUndefined(modifiedState.apiRequestWithParams)) {
                    if (action.payload.PagingInfo.PageNumber == 1) {
                        modifiedState.currentRiskAssessmentSubstancesCount = action.payload.PagingInfo.TotalCount;
                        modifiedState.currentRiskAssessmentSubstancesPagingInfo = action.payload.PagingInfo;
                    }
                }
                else
                    modifiedState.currentRiskAssessmentSubstancesPagingInfo = action.payload.PagingInfo;


                return Object.assign({}, modifiedState, { currentRiskAssessmentSubstances: Immutable.List<RASubstance>(action.payload.Entities), loading: false });
            }
        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT:
            {
                return state;
            }
        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (isNullOrUndefined(action.payload)) return modifiedState;
                let riskAssessmentTypeId = isNullOrUndefined(action.payload) ? fromConstants.generalRiskAssessmentTypeId : action.payload.RiskAssessmentTypeId;
                let substances = isNullOrUndefined(action.payload.RASubstances) ? [] : action.payload.RASubstances;
                let substancesLength = isNullOrUndefined(action.payload.RASubstances) ? 0 : action.payload.RASubstances.length;
                modifiedState.currentRiskAssessment = action.payload;
                modifiedState.riskAssessmentName = action.payload.Name;
                modifiedState.currentRiskAssessmentDocuments = extractDocumentsWithPagging(action.payload);
                modifiedState.currentRiskAssessmentSubstances = extractSubstanceWithPagging(action.payload);
                modifiedState.currentRiskAssessmentDocumentPagingInfo = extractDataTableOptions(action.payload);
                modifiedState.currentRiskAssessmentDocumentCount = extractDocumentsLength(action.payload);
                modifiedState.riskAssessmentTypeId = riskAssessmentTypeId;
                modifiedState.riskAssessmentName = action.payload.Name;
                modifiedState.currentRiskAssessmentSubstancesCount = modifiedState.currentRiskAssessmentSubstances.size;
                if (!isNullOrUndefined(modifiedState.currentRiskAssessment.RAAdditionalControls)) {
                    modifiedState.currentRiskAssessment.RAAdditionalControls = modifiedState.currentRiskAssessment.RAAdditionalControls.filter((item) => item.IsDeleted === false);
                }
                modifiedState.currentRiskAssessmentSubstancesPagingInfo = new PagingInfo(modifiedState.currentRiskAssessmentSubstances.size, modifiedState.currentRiskAssessmentSubstances.size, 1, 10);
                return modifiedState;
            }
        case riskAssessmentActions.ActionTypes.CREATE_RISKASSESSMENT: {
            return Object.assign({}, state, { riskAssessmentAddUpdateComplete: false });
        }

        case riskAssessmentActions.ActionTypes.CREATE_RISKASSESSMENT_COMPLETE: {
            return Object.assign({}, state, { riskAssessmentAddUpdateComplete: true, currentRiskAssessment: action.payload });
        }

        case riskAssessmentActions.ActionTypes.UPDATE_RISKASSESSMENT: {
            return Object.assign({}, state, { riskAssessmentAddUpdateComplete: false });
        }

        case riskAssessmentActions.ActionTypes.UPDATE_RISKASSESSMENT_COMPLETE: {
            //return Object.assign({}, state, { riskAssessmentAddUpdateComplete: true, currentRiskAssessment: action.payload, currentRiskAssessmentDocuments: extractDocuments(action.payload), riskAssessmentName: action.payload.Name });
            return Object.assign({}, state, { riskAssessmentAddUpdateComplete: true, currentRiskAssessment: action.payload, currentRiskAssessmentDocuments: extractDocumentsWithPagging(action.payload), riskAssessmentName: action.payload.Name });
        }
        case riskAssessmentActions.ActionTypes.REMOVE_DOCUMENT: {
            return Object.assign({}, state);
        }
        case riskAssessmentActions.ActionTypes.REMOVE_DOCUMENT_COMPLETE: {
            return Object.assign({}, state);
        }
        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_FILTER_DOCUMENTS: {
            let modifiedState = Object.assign({}, state, {});
            let newEntities = modifiedState.currentRiskAssessment.Documents;
            let selectedValue = action.payload.Search;
            let direction = action.payload.Direction;
            if (direction == SortDirection.Descending) {
                newEntities.sort((a, b) => a.FileName.localeCompare(b.FileName))
            }
            else {
                newEntities.sort((a, b) => a.FileName.localeCompare(b.FileName)).reverse();
            }

            if (selectedValue == "All")
                newEntities = modifiedState.currentRiskAssessment.Documents
            else if (selectedValue == "Images") {
                newEntities = modifiedState.currentRiskAssessment.Documents.filter(function (document) {
                    return document.IconClass == "jpg" || document.IconClass == "bmp" || document.IconClass == "png" || document.IconClass == "gif" || document.IconClass == "jpeg";
                });
            }

            else if (selectedValue == "Word") {
                newEntities = modifiedState.currentRiskAssessment.Documents.filter(function (document) {
                    return document.IconClass == "doc" || document.IconClass == "docx";
                });
            }
            else if (selectedValue == "Excel") {
                newEntities = modifiedState.currentRiskAssessment.Documents.filter(function (document) {
                    return document.IconClass == "xls" || document.IconClass == "xlsm" || document.IconClass == "xlsx";
                });
            }
            else {
                newEntities = modifiedState.currentRiskAssessment.Documents.filter(function (document) {
                    return document.IconClass == selectedValue.toLowerCase();
                });
            }
            let pageNumber = modifiedState.currentRiskAssessmentDocumentPagingInfo.currentPage;
            let PageSize = modifiedState.currentRiskAssessmentDocumentPagingInfo.noOfRows;
            let startIndex = (pageNumber * PageSize) - PageSize;
            let endIndex = (pageNumber * PageSize);
            let pagedData = Immutable.List<Document>(newEntities.slice(startIndex, endIndex));
            let dataOption = new DataTableOptions(modifiedState.currentRiskAssessmentDocumentPagingInfo.currentPage, modifiedState.currentRiskAssessmentDocumentPagingInfo.noOfRows);
            modifiedState.currentRiskAssessmentDocuments = Immutable.List(pagedData);
            modifiedState.currentRiskAssessmentDocumentPagingInfo = dataOption;
            modifiedState.currentRiskAssessmentDocumentCount = newEntities.length;
            return modifiedState;
        }

        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_MEASURES:
            {
                return Object.assign({}, state, { loading: true })
            }
        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_MEASURES_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(modifiedState.currentRiskAssessment)) {
                    modifiedState.currentRiskAssessment.Measures = action.payload;
                }
                modifiedState.loading = false;
                return modifiedState;
            }
        case riskAssessmentActions.ActionTypes.LOAD_ADDITIONAL_CONTROL_RISKASSESSMENT_LIST:
            {
                return Object.assign({}, state, {})
            }
        case riskAssessmentActions.ActionTypes.LOAD_ADDITIONAL_CONTROL_RISKASSESSMENT_LIST_COMPLETE:
            {

                return Object.assign({}, state, { additionalControlsRiskAssessmentsList: action.payload.Entities });
            }
        case riskAssessmentActions.ActionTypes.LOAD_RA_ADDITIONAL_CONTROL_LIST:
            {
                return Object.assign({}, state, {})
            }
        case riskAssessmentActions.ActionTypes.LOAD_RA_ADDITIONAL_CONTROL_LIST_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(modifiedState.currentRiskAssessment)) {
                    modifiedState.currentRiskAssessment.RAAdditionalControls = action.payload;
                }
                return modifiedState;
            }
        case riskAssessmentActions.ActionTypes.LOAD_ADDITIONAL_CONTROL_CATEGORY_TEXT:
            {
                return Object.assign({}, state, {})
            }
        case riskAssessmentActions.ActionTypes.LOAD_ADDITIONAL_CONTROL_CATEGORY_TEXT_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(modifiedState.currentRiskAssessment)) {
                    modifiedState.currentRiskAssessment.AdditionalControlCategoryText = action.payload;
                }
                return modifiedState;
            }
        case riskAssessmentActions.ActionTypes.LOAD_EXAMPLE_ROUTES_OF_EXPOSURE:
            {
                return Object.assign({}, state, { loading: true });
            }
        case riskAssessmentActions.ActionTypes.LOAD_ROUTES_OF_EXPOSURE_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, { loading: false });
                modifiedState.riskAssessmentRoutesOfExposureList = action.payload;
                modifiedState.filteredRiskAssessmentRoutesOfExposureList = action.payload;
                return modifiedState;
            }
        case riskAssessmentActions.ActionTypes.LOAD_ROUTES_OF_EXPOSURE_BY_RISKASSESSMENT_ID:
            {
                return Object.assign({}, state, { loading: true });
            }
        case riskAssessmentActions.ActionTypes.LOAD_ROUTES_OF_EXPOSURE_BY_RISKASSESSMENT_ID_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, { loading: false });
                if (!isNullOrUndefined(modifiedState.currentRiskAssessment)) {
                    modifiedState.currentRiskAssessment.RARoutesOfExposures = action.payload.filter((item) => item.IsDeleted === false);
                    modifiedState.loading = false;
                }
                return modifiedState;
            }
        case riskAssessmentActions.ActionTypes.CREATE_RISKASSESSMENT_ROUTE_OF_EXPOSURE:
            {
                return Object.assign({}, state, {});
            }
        case riskAssessmentActions.ActionTypes.UPDATE_RISKASSESSMENT_ROUTE_OF_EXPOSURE:
            {
                return Object.assign({}, state, {});
            }
        case riskAssessmentActions.ActionTypes.REMOVE_RISKASSESSMENT_ROUTE_OF_EXPOSURE:
            {
                return Object.assign({}, state, {});
            }
        case riskAssessmentActions.ActionTypes.FILTER_ROUTES_OF_EXPOSURE:
            {
                let modifiedState = Object.assign({}, state, { loading: false });
                if (action.payload.trim().length >= 1) {
                    let filteredlist = [];
                    modifiedState.riskAssessmentRoutesOfExposureList.map(m => {
                        if (m.Name.toLowerCase().indexOf(action.payload.toLowerCase()) !== -1) {
                            filteredlist.push(m);
                        }
                    });
                    //    filteredlist.filter((obj) => obj.Name.indexOf(action.payload) !== -1);
                    modifiedState.filteredRiskAssessmentRoutesOfExposureList = Immutable.List(filteredlist);
                } else {
                    modifiedState.filteredRiskAssessmentRoutesOfExposureList = modifiedState.riskAssessmentRoutesOfExposureList;
                }
                return modifiedState;
            }
        case riskAssessmentActions.ActionTypes.LOAD_COSHHINVENTORY:
            {
                return Object.assign({}, state);
            }
        case riskAssessmentActions.ActionTypes.LOAD_COSHHINVENTORY_COMPLETE:
            {
                return Object.assign({}, state, { currentRiskAssessmentCoshhInventory: action.payload });
            }
        case riskAssessmentActions.ActionTypes.ADD_RASUBSTANCE:
            {
                return Object.assign({}, state);
            }
        case riskAssessmentActions.ActionTypes.ADD_RASUBSTANCE_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(modifiedState.currentRiskAssessmentSubstances)) {
                    modifiedState.currentRiskAssessmentSubstances = modifiedState.currentRiskAssessmentSubstances.push(action.payload);
                }
                else {
                    let substances = new Array<RASubstance>();
                    substances.push(action.payload);
                    modifiedState.currentRiskAssessmentSubstances = Immutable.List<RASubstance>(substances);
                }
                modifiedState.currentRiskAssessment.RASubstances = modifiedState.currentRiskAssessmentSubstances.toArray();

                let pageNumber = 1; let PageSize = 10;
                if (!isNullOrUndefined(action.payload.PageNumber) || !isNullOrUndefined(action.payload.PageSize)) {
                    pageNumber = action.payload.PageNumber;
                    PageSize = action.payload.PageSize;
                }

                let startIndex = (pageNumber * PageSize) - PageSize;
                let endIndex = (pageNumber * PageSize);
                let totalRecords = modifiedState.currentRiskAssessmentSubstances.toArray().slice(startIndex, endIndex);
                let pagedData = Immutable.List<RASubstance>(totalRecords);
                modifiedState.currentRiskAssessmentSubstances = pagedData;

                modifiedState.currentRiskAssessmentSubstancesCount = modifiedState.currentRiskAssessment.RASubstances.length;
                modifiedState.currentRiskAssessmentSubstancesPagingInfo = new PagingInfo(modifiedState.currentRiskAssessment.RASubstances.length, modifiedState.currentRiskAssessment.RASubstances.length, 1, 10);

                return modifiedState;
            }
        case riskAssessmentActions.ActionTypes.UPDATE_RASUBSTANCE:
            {
                return Object.assign({}, state);
            }
        case riskAssessmentActions.ActionTypes.UPDATE_RASUBSTANCE_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                let id = action.payload.Id;
                let selectedSubstances = modifiedState.currentRiskAssessmentSubstances;
                let index = selectedSubstances.findIndex(s => s.Id === id);
                if (index !== -1) {
                    modifiedState.currentRiskAssessmentSubstances = modifiedState.currentRiskAssessmentSubstances.update(index, value => value = action.payload);
                    modifiedState.currentRiskAssessment.RASubstances = modifiedState.currentRiskAssessmentSubstances.toArray();
                }
                return modifiedState;
            }
        case riskAssessmentActions.ActionTypes.REMOVE_RASUBSTANCE:
            {
                return Object.assign({}, state);
            }
        case riskAssessmentActions.ActionTypes.REMOVE_RASUBSTANCE_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                let id = action.payload;
                let selectedSubstances = modifiedState.currentRiskAssessment.RASubstances;
                let index = selectedSubstances.findIndex(s => s.Id === id);

                modifiedState.currentRiskAssessment.RASubstances.splice(index, 1);
                if (index !== -1) {
                    modifiedState.currentRiskAssessmentSubstances = Immutable.List<RASubstance>(modifiedState.currentRiskAssessment.RASubstances);
                    modifiedState.currentRiskAssessment.RASubstances = modifiedState.currentRiskAssessmentSubstances.toArray();

                    modifiedState.currentRiskAssessmentSubstancesCount = modifiedState.currentRiskAssessment.RASubstances.length;
                    modifiedState.currentRiskAssessmentSubstancesPagingInfo = new PagingInfo(modifiedState.currentRiskAssessment.RASubstances.length, modifiedState.currentRiskAssessment.RASubstances.length, 1, 10);
                }
                return modifiedState;
            }
        case riskAssessmentActions.ActionTypes.ADD_RACOSHINVENTORY:
            {
                return Object.assign({}, state);
            }
        case riskAssessmentActions.ActionTypes.ADD_RACOSHINVENTORY_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(modifiedState.currentRiskAssessmentCoshhInventory)) {
                    modifiedState.currentRiskAssessmentCoshhInventory.push(action.payload);
                }
                return modifiedState;
            }
        case riskAssessmentActions.ActionTypes.PEOCEDURES_RISKASSESSMENT_CREATE: {
            return Object.assign({}, state, { riskAssessmentAddUpdateComplete: false });
        }
        case riskAssessmentActions.ActionTypes.PEOCEDURES_RISKASSESSMENT_UPDATE: {
            return Object.assign({}, state, { riskAssessmentAddUpdateComplete: false });
        }
        case riskAssessmentActions.ActionTypes.PEOCEDURES_RISKASSESSMENT_CREATE_UPDATE_COMPLETE: {
            let modifiedState = Object.assign({}, state, { riskAssessmentAddUpdateComplete: true });
            modifiedState.currentRiskAssessment.RAProcedures = action.payload;
            return modifiedState;
        }
        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_HAZARDS:
            {
                return Object.assign({}, state, { hazardsLoading: true });
            }
        case riskAssessmentActions.ActionTypes.LOAD_HAZARDS: {
            return Object.assign({}, state, { allHazardsLoading: true })
        }
        case riskAssessmentActions.ActionTypes.LOAD_HAZARDS_COMPLETE:
            {

                let modifiedState = Object.assign({}, state, { loading: false });
                if (action.payload.isExample === true) {
                    if (action.payload.pageNumber === 1) {
                        modifiedState.totalExampleHazardsCount = action.payload.totalCount;
                    }
                    modifiedState.exampleHazardsList = action.payload.data;
                } else if (action.payload.isExample === false) {
                    if (action.payload.pageNumber === 1) {
                        modifiedState.totalHazardsCount = action.payload.totalCount;
                    }
                    modifiedState.HazardsList = action.payload.data;
                }
                return Object.assign({}, state, {
                    totalExampleHazardsCount: modifiedState.totalExampleHazardsCount,
                    totalHazardsCount: modifiedState.totalHazardsCount,
                    exampleHazardsList: modifiedState.exampleHazardsList,
                    HazardsList: modifiedState.HazardsList,
                    allHazardsLoading: false
                })
            }

        case riskAssessmentActions.ActionTypes.CREATE_UPDATE_RISKASSESSMENT_HAZARD_COMPLETE: {
            let modifiedState = Object.assign([], state.currentRiskAssessment.RAHazards);

            if (!isNullOrUndefined(modifiedState)) {
                let selectedHazards = modifiedState || new Array<RiskAssessmentHazard>();
                let selectedHazard = selectedHazards.find(s => s.Id === action.payload.Id);
                if (isNullOrUndefined(selectedHazard)) {
                    selectedHazards.push(action.payload);
                }
                else {
                    let index = selectedHazards.findIndex(f => f.Id === action.payload.Id);
                    if (index !== -1) {
                        selectedHazards[index] = action.payload;
                    }
                }
                modifiedState = selectedHazards;
            }
            state.currentRiskAssessment.RAHazards = modifiedState
            return Object.assign({}, state);
        }

        case riskAssessmentActions.ActionTypes.REMOVE_HAZARD_COMPLETE: {
            let modifiedState = Object.assign([], state.currentRiskAssessment.RAHazards, {});
            if (!isNullOrUndefined(modifiedState)) {
                let selectedHazards = modifiedState;
                let index = selectedHazards.findIndex(f => f.Id === action.payload);
                if (index !== -1) {
                    modifiedState[index].IsDeleted = true;
                }
            }
            state.currentRiskAssessment.RAHazards = modifiedState;
            return Object.assign({}, state);
        }

        case riskAssessmentActions.ActionTypes.SET_RISK_ASSESSMENT_NAME: {
            return Object.assign({}, state, { riskAssessmentName: action.payload });
        }
        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_HAZARDS_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, { hazardsLoading: false });
                if (!isNullOrUndefined(modifiedState.currentRiskAssessment)) {
                    modifiedState.currentRiskAssessment.RAHazards = action.payload;
                }

                return modifiedState;
            }
        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_TASKS:
            {
                let modifiedState = Object.assign({}, state, { loading: true, tasksListApiRequest: action.payload });
                return modifiedState;
            }
        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_TASKS_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (action.payload.PagingInfo && action.payload.PagingInfo.PageNumber == 1) {
                    modifiedState.tasksListTotalCount = action.payload.PagingInfo.TotalCount;
                }
                if (!isNullOrUndefined(modifiedState.currentRiskAssessment)) {
                    modifiedState.currentRiskAssessment.RAFurtherControlMeasuresTasks = action.payload.Entities;
                    modifiedState.loading = false;
                    modifiedState.tasksListPagingInfo = action.payload.PagingInfo;
                }
                return modifiedState;
            }
        case riskAssessmentActions.ActionTypes.CREATE_RISKASSESSMENT_TASK:
            {
                return Object.assign({}, state, {});
            }
        case riskAssessmentActions.ActionTypes.UPDATE_RISKASSESSMENT_TASK:
            {
                return Object.assign({}, state, {});
            }

        case riskAssessmentActions.ActionTypes.UPDATE_RISKASSESSMENT_COMPLETE_TASK:
            {
                let modifiedState = Object.assign([], state.currentRiskAssessment.RAFurtherControlMeasuresTasks)
                if (!isNullOrUndefined(modifiedState)) {
                    modifiedState = action.payload.Entities
                }
                state.currentRiskAssessment.RAFurtherControlMeasuresTasks = modifiedState;
                return Object.assign({}, state, {});
            }
        case riskAssessmentActions.ActionTypes.REMOVE_RISKASSESSMENT_TASK:
            {
                return Object.assign({}, state, {});
            }
        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_TASK_BY_ID:
            {
                return Object.assign({}, state, {});
            }
        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_TASK_BY_ID_COMPLETE:
            {
                return Object.assign({}, state, { selectedRATask: action.payload });
            }
        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_DOCUMENTS_PAGGING_RESULT: {
            let modifiedState = Object.assign({}, state, {});
            let totalRecords = Immutable.List<Document>(modifiedState.currentRiskAssessment.Documents);
            let pageNumber = action.payload.PageNumber;
            let PageSize = action.payload.PageSize;
            let startIndex = (pageNumber * PageSize) - PageSize;
            let endIndex = (pageNumber * PageSize);
            let pagedData = Immutable.List<Document>(totalRecords.slice(startIndex, endIndex));
            modifiedState.currentRiskAssessmentDocuments = pagedData;
            let dataOption = new DataTableOptions(pageNumber, PageSize);
            modifiedState.currentRiskAssessmentDocumentPagingInfo = dataOption;

            return modifiedState;
        }
        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_SUBSTANCE_PAGGING_RESULT: {
            let modifiedState = Object.assign({}, state, {});
            let totalRecords = Immutable.List<RASubstance>(modifiedState.currentRiskAssessment.RASubstances.filter(m => !m.IsDeleted));
            let pageNumber = action.payload.PageNumber;
            let PageSize = action.payload.PageSize;
            let startIndex = (pageNumber * PageSize) - PageSize;
            let endIndex = (pageNumber * PageSize);
            let pagedData = Immutable.List<RASubstance>(totalRecords.slice(startIndex, endIndex));
            modifiedState.currentRiskAssessmentSubstances = pagedData;
            return modifiedState;
        }
        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_SUBSTANCE_SORT_RESULT: {
            let modifiedState = Object.assign({}, state, {});
            let newEntities = modifiedState.currentRiskAssessment.RASubstances.filter(m => !m.IsDeleted);
            let direction = action.payload.Direction;
            if (!isNullOrUndefined(newEntities)) {
                if (direction == SortDirection.Descending) {
                    newEntities.sort((a, b) => a.Substance.localeCompare(b.Substance))
                }
                else {
                    newEntities.sort((a, b) => a.Substance.localeCompare(b.Substance)).reverse();
                }
                let pageNumber = modifiedState.currentRiskAssessmentSubstancesPagingInfo.PageNumber;
                let PageSize = action.payload.PageSize;
                let startIndex = (pageNumber * PageSize) - PageSize;
                let endIndex = (pageNumber * PageSize);
                let pagedData = Immutable.List<RASubstance>(newEntities.slice(startIndex, endIndex));
                modifiedState.currentRiskAssessmentSubstances = pagedData;
            }
            return modifiedState;
        }
        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_COUNT: {
            return Object.assign({}, state, { raChangeStatus: false });
        }

        case riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_COUNT_COMPLETE: {

            return Object.assign({}, state, { riskAssessmentsCountByStatus: action.payload });
        }
        case riskAssessmentActions.ActionTypes.SET_RISKASSESSMENT_TYPE: {
            return Object.assign({}, state, { riskAssessmentTypeId: action.payload });
        }

        case riskAssessmentActions.ActionTypes.COPY_RISKASSESSMENT: {

            return Object.assign({}, state, {});
        }
        case riskAssessmentActions.ActionTypes.COPY_RISKASSESSMENT_COMPLETE: {
            return Object.assign({}, state, {});
        }
        case riskAssessmentActions.ActionTypes.REVIEW_RISKASSESSMENT_ACTION: {
            return Object.assign({}, state, { raChangeStatus: false });
        }
        case riskAssessmentActions.ActionTypes.REVIEW_RISKASSESSMENT_COMPLETE_ACTION: {

            return Object.assign({}, state, { raChangeStatus: true });
        }
        case riskAssessmentActions.ActionTypes.SAVE_ADDITIONAL_CONTROLS_LIST: {
            return Object.assign({}, state, {});
        }
        case riskAssessmentActions.ActionTypes.SAVE_ADDITIONAL_CONTROLS_TEXT: {
            return Object.assign({}, state, {});
        }
        case riskAssessmentActions.ActionTypes.SAVE_ADDITIONAL_CONTROLS_LIST_COMPLETE: {
            let modifiedState = Object.assign({}, state, {});
            if (!isNullOrUndefined(modifiedState.currentRiskAssessment)) {
                modifiedState.currentRiskAssessment.RAAdditionalControls = action.payload;
            }
            return modifiedState;
        }
        case riskAssessmentActions.ActionTypes.SAVE_ADDITIONAL_CONTROLS_TEXT_COMPLETE: {
            let modifiedState = Object.assign({}, state, {});
            if (!isNullOrUndefined(modifiedState.currentRiskAssessment)) {
                modifiedState.currentRiskAssessment.AdditionalControlCategoryText = action.payload;
            }
            return modifiedState;

        }
        case riskAssessmentActions.ActionTypes.EXPORT_RISKASSESSMENT_PREVIEW:
            {
                return Object.assign({}, state, {});
            }
        case riskAssessmentActions.ActionTypes.EXPORT_RISKASSESSMENT_PREVIEW_COMPLETE:
            {
                return Object.assign({}, state, { riskAssessmentDocument: action.payload });
            }
        case riskAssessmentActions.ActionTypes.LOAD_FREQUENTLY_USED_CONTROLS: {
            return Object.assign({}, state, {});
        }
        case riskAssessmentActions.ActionTypes.LOAD_FREQUENTLY_USED_CONTROLS_COMPLETE: {
            return Object.assign({}, state, { frequentlyUsedControls: action.payload });
        }
        case riskAssessmentActions.ActionTypes.LOAD_SUGGESTED_CONTROLS: {
            return Object.assign({}, state, {});
        }
        case riskAssessmentActions.ActionTypes.LOAD_SUGGESTED_CONTROLS_COMPLETE: {
            return Object.assign({}, state, { suggestedControls: action.payload });
        }
        case riskAssessmentActions.ActionTypes.ADD_CONTROL: {
            return Object.assign({}, state, {});
        }
        case riskAssessmentActions.ActionTypes.ADD_CONTROL_COMPLETE: {
            let modifiedState = Object.assign([], state.currentRiskAssessment.RAControls);
            if (!isNullOrUndefined(modifiedState)) {
                modifiedState.push(action.payload);
            }
            state.currentRiskAssessment.RAControls = modifiedState;
            return Object.assign({}, state);
        }
        case riskAssessmentActions.ActionTypes.REMOVE_CONTROL: {
            return Object.assign({}, state)
        }
        case riskAssessmentActions.ActionTypes.REMOVE_CONTROL_COMPLETE: {
            let modifiedState = Object.assign([], state.currentRiskAssessment.RAControls);
            if (!isNullOrUndefined(modifiedState)) {
                let removedControl = modifiedState.find((control) => control.Id === action.payload);
                let removedIndex = modifiedState.indexOf(removedControl);
                modifiedState.splice(removedIndex, 1);
            }
            state.currentRiskAssessment.RAControls = modifiedState;
            return Object.assign({}, state);
        }
        case riskAssessmentActions.ActionTypes.LOAD_ALL_CONTROLS: {
            return Object.assign({}, state, { allControlsLoading: true })
        }
        case riskAssessmentActions.ActionTypes.LOAD_ALL_CONTROLS_COMPLETE: {

            let modifiedState = Object.assign({}, state);
            if (action.payload.pageNumber === 1) {
                modifiedState.allControlsCount = action.payload.totalCount;
            }
            modifiedState.allControlsList = action.payload.data;
            modifiedState.allControlsLoading = false;
            return modifiedState;
        }

        case riskAssessmentActions.ActionTypes.UPDATE_RISK_ASSESSMENT_CONTROL: {
            return Object.assign({}, state);
        }
        case riskAssessmentActions.ActionTypes.UPDATE_RISK_ASSESSMENT_CONTROL_COMPLETE: {
            let modifiedState = Object.assign([], state.currentRiskAssessment.RAControls);
            if (!isNullOrUndefined(modifiedState)) {
                let index = modifiedState.findIndex((control) => control.Id === action.payload.Id && control.IsDeleted === false);
                modifiedState[index] = action.payload;
            }
            state.currentRiskAssessment.RAControls = modifiedState;
            return Object.assign({}, state);
        }
        case riskAssessmentActions.ActionTypes.APPROVE_RISKASSESSMENT: {
            return Object.assign({}, state, { raChangeStatus: false });
        }
        case riskAssessmentActions.ActionTypes.APPROVE_RISKASSESSMENT_COMPLETE: {
            return Object.assign({}, state, { raChangeStatus: true });
        }
        case riskAssessmentActions.ActionTypes.DELETE_RISKASSESSMENT: {
            return Object.assign({}, state, { raChangeStatus: false });
        }
        case riskAssessmentActions.ActionTypes.DELETE_RISKASSESSMENT_COMPLETE: {
            return Object.assign({}, state, { raChangeStatus: true });
        }
        case riskAssessmentActions.ActionTypes.ARCHIVED_RISKASSESSMENT: {
            return Object.assign({}, state, { raChangeStatus: false });
        }
        case riskAssessmentActions.ActionTypes.ARCHIVED_RISKASSESSMENT_COMPLETE: {
            return Object.assign({}, state, { raChangeStatus: true });
        }
        case riskAssessmentActions.ActionTypes.Load_SELECTED_HAZARDS: {
            return Object.assign({}, state);
        }
        case riskAssessmentActions.ActionTypes.Load_SELECTED_HAZARDS_COMPLETE: {
            //let 
        }
        case riskAssessmentActions.ActionTypes.CREATE_CONTROL_COMPLETE: {
            let modifiedState = Object.assign([], state.currentRiskAssessment.RAControls)
            if (!isNullOrUndefined(modifiedState)) {
                modifiedState.push(action.payload);
            }
            state.currentRiskAssessment.RAControls = modifiedState;
            return Object.assign({}, state);
        }
        case riskAssessmentActions.ActionTypes.UPDATE_RA_PRINT_DESCRIPTION_STATUS: {
            return Object.assign({}, state, { currentRiskAsessment: action.payload.data });
        }
        case riskAssessmentActions.ActionTypes.UPDATE_RA_PRINT_DESCRIPTION_STATUS_COMPLETE: {
            return Object.assign({}, state);
        }
        case riskAssessmentActions.ActionTypes.LOAD_RA_HAZARD_CATEGORY_TEXT_COMPLETE: {
            state.raHazardCategoryText = action.payload.Entities;
            return Object.assign({}, state);
        }
        case riskAssessmentActions.ActionTypes.CREATE_RA_HAZARD_CATEGORY_TEXT_COMPLETE: {
            let modifiedState = Object.assign([], state.raHazardCategoryText);
            if (!isNullOrUndefined(modifiedState)) {
                let id = action.payload.Id
                let index = modifiedState.findIndex((item) => item.Id === id);
                if (index === -1) {
                    modifiedState.push(action.payload);
                } else {
                    modifiedState[index] = action.payload;
                }
            }
            state.raHazardCategoryText = modifiedState;
            return Object.assign({}, state);
        }
        case riskAssessmentActions.ActionTypes.UPDATE_RA_HAZARD_CATEGORY_TEXT_COMPLETE: {
            let modifiedState = Object.assign([], state.raHazardCategoryText);
            if (!isNullOrUndefined(modifiedState)) {
                let id = action.payload.Id
                let index = modifiedState.findIndex((item) => item.Id === id);
                if (index === -1) {
                    modifiedState.push(action.payload);
                } else {
                    modifiedState[index] = action.payload;
                }
            }
            state.raHazardCategoryText = modifiedState;
            return Object.assign({}, state);
        }
        case riskAssessmentActions.ActionTypes.LOAD_RA_CONTROLS_CATEGORY_TEXT_COMPLETE: {
            if (isNullOrUndefined(action.payload.Entities)) {
                state.raControlsCategoryText = action.payload;
            } else {
                state.raControlsCategoryText = action.payload.Entities;
            }

            return Object.assign({}, state);
        }
        case riskAssessmentActions.ActionTypes.CREATE_RA_CONTROLS_CATEGORY_TEXT_COMPLETE: {
            let modifiedState = Object.assign([], state.raControlsCategoryText);
            if (!isNullOrUndefined(modifiedState)) {
                let id = action.payload.Id
                let index = modifiedState.findIndex((item) => item.Id === id);
                if (index === -1) {
                    modifiedState.push(action.payload);
                } else {
                    modifiedState[index] = action.payload;
                }
            }
            state.raControlsCategoryText = modifiedState;
            return Object.assign({}, state);
        }
        case riskAssessmentActions.ActionTypes.UPDATE_RA_CONTROLS_CATEGORY_TEXT_COMPLETE: {
            let modifiedState = Object.assign([], state.raControlsCategoryText);
            if (!isNullOrUndefined(modifiedState)) {
                let id = action.payload.Id
                let index = modifiedState.findIndex((item) => item.Id === id);
                if (index === -1) {
                    modifiedState.push(action.payload);
                } else {
                    modifiedState[index] = action.payload;
                }
            }
            state.raControlsCategoryText = modifiedState;
            return Object.assign({}, state);
        }
        default:
            return state;
    }
}

export function getAllControlsLoading(state$: Observable<RiskAssessmentState>): Observable<boolean> {
    return state$.select(s => s.allControlsLoading);
}

export function getAllHazardsLoading(state$: Observable<RiskAssessmentState>): Observable<boolean> {
    return state$.select(s => s.allHazardsLoading);
}

export function getRiskAssessmentCountByStatus(state$: Observable<RiskAssessmentState>): Observable<Map<string, number>> {
    return state$.select(s => s && s.riskAssessmentsCountByStatus);
}

export function getRiskAssessmentListData(state$: Observable<RiskAssessmentState>): Observable<Immutable.List<RiskAssessment>> {
    return state$.select(s => s && s.riskAssessmentList);
}

export function getRiskAssessmentTotalCount(state$: Observable<RiskAssessmentState>): Observable<number> {
    return state$.select(s => s && s.riskAssessmentTotalCount);
}

export function getRiskAssessmentPageInformation(state$: Observable<RiskAssessmentState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.apiRequestWithParams && new DataTableOptions(state.apiRequestWithParams.PageNumber, state.apiRequestWithParams.PageSize, state.apiRequestWithParams.SortBy.SortField, state.apiRequestWithParams.SortBy.Direction));
}

export function getRiskAssessmentLoadingStatus(state$: Observable<RiskAssessmentState>): Observable<boolean> {
    return state$.select(s => s && s.loading);
}

export function getRiskAssessmentNameChange(state$: Observable<any>): Observable<any> {
    return state$.select(s => s.nameFilter);
}
export function getRiskAssessmentSiteChange(state$: Observable<any>): Observable<any> {
    return state$.select(s => s.siteFilter);
}
export function getRiskAssessmentTypeChange(state$: Observable<any>): Observable<any> {
    return state$.select(s => s.assessmentTypeFilter);
}
export function getRiskAssessmentWorkSpaceChange(state$: Observable<any>): Observable<any> {
    return state$.select(s => s.workspaceFilter);
}

export function getRiskAssessmentSectorFilterChange(state$: Observable<any>): Observable<any> {
    return state$.select(s => s.sectorFilter);
}

export function getCurrentRiskAssessmentData(state$: Observable<RiskAssessmentState>): Observable<RiskAssessment> {
    return state$.select(s => s.currentRiskAssessment);
};

export function getRiskAssessmentInformationItems(state$: Observable<RiskAssessmentState>): Observable<AeInformationBarItem[]> {
    return state$.select(state => state && state.riskAssessmentInformationItems);
};

export function getCurrentAssessment(state$: Observable<RiskAssessmentState>): Observable<RiskAssessment> {
    return state$.select(s => s.currentRiskAssessment);
}

export function getCurrentRiskAssessmentId(state$: Observable<RiskAssessmentState>): Observable<string> {
    return state$.select(s => s.currentRiskAssessment && s.currentRiskAssessment.Id);
}

export function getCurrentAssessmentMeasures(state$: Observable<RiskAssessmentState>): Observable<TaskActivity[]> {
    return state$.select(s => s && s.currentRiskAssessment && s.currentRiskAssessment.Measures);
}

export function getCurrentAssessmentDocuments(state$: Observable<RiskAssessmentState>): Observable<Immutable.List<Document>> {
    return state$.select(s => s && s.currentRiskAssessment && extractDocuments(s.currentRiskAssessment));
}

export function getCurrentAssessmentDocumentsLength(state$: Observable<RiskAssessmentState>): Observable<number> {
    return state$.select(s => s.currentRiskAssessmentDocumentCount);
}

export function getCurrentAssessmentAdditionalControls(state$: Observable<RiskAssessmentState>): Observable<Map<string, Array<RAAdditionalControl>>> {

    return state$.select(s => s && s.currentRiskAssessment && extractControlsByGroup(s.currentRiskAssessment.RAAdditionalControls));
}
export function getAdditionalControlsRiskAssessmentsList(state$: Observable<RiskAssessmentState>): Observable<Map<string, Array<RAAdditionalControl>>> {
    return state$.select(s => s && s.currentRiskAssessment && extractControlsByGroup(s.additionalControlsRiskAssessmentsList));
}
export function getRAAdditionalControlsRiskAssessmentsList(state$: Observable<RiskAssessmentState>): Observable<Array<RAAdditionalControl>> {
    return state$.select(s => s && s.currentRiskAssessment && s.currentRiskAssessment.RAAdditionalControls);
}
export function getAdditionalControlsCategoryText(state$: Observable<RiskAssessmentState>): Observable<Array<AdditionalControlCategoryText>> {
    return state$.select(s => s && s.currentRiskAssessment && s.currentRiskAssessment.AdditionalControlCategoryText);
}
export function getAllHazardsData(state$: Observable<RiskAssessmentState>): Observable<{ data: Immutable.List<Hazard>, allHazardsLoading: boolean }> {
    return state$.select(s => extractAllHazardsResponse(s));
}

export function getHazardCount(state$: Observable<RiskAssessmentState>): Observable<Map<string, number>> {
    return state$.select(s => getHazardsCount(s.totalHazardsCount, s.totalExampleHazardsCount));
}

export function getSelectedHazardsData(state$: Observable<RiskAssessmentState>): Observable<Array<RiskAssessmentHazard>> {
    return state$.select(s => getSelectedHazarads(s.currentRiskAssessment));
}
export function getCurrentAssessmentFilterDocuments(state$: Observable<RiskAssessmentState>): Observable<Immutable.List<Document>> {

    return state$.select(s => s && s.currentRiskAssessment && s.currentRiskAssessmentDocuments)
}
export function getCurrentRiskAssessmentDocumentListDataTableOptions(state$: Observable<RiskAssessmentState>): Observable<DataTableOptions> {

    return state$.select(state => extractDocumentPagingDataTableOptions(state.currentRiskAssessmentDocumentPagingInfo));
}

export function getExampleRoutesOfExposureData(state$: Observable<RiskAssessmentState>): Observable<Immutable.List<RiskAssessmentHazard>> {
    return state$.select(s => s && s.filteredRiskAssessmentRoutesOfExposureList);
}

export function getCurrentRiskAssessmentRoutesOfExposureData(state$: Observable<RiskAssessmentState>): Observable<RiskAssessmentHazard[]> {
    return state$.select(s => s.currentRiskAssessment && s.currentRiskAssessment.RAHazards.filter((item) => (item.Category === HazardCategory.RoutesOfExposure && item.IsDeleted === false)));
}
export function getCurrentRiskAssessmentSubstances(state$: Observable<RiskAssessmentState>): Observable<Immutable.List<RASubstance>> {

    return state$.select(s => s.currentRiskAssessmentSubstances);
}
export function getCurrentRiskAssessmentSubstancesTotalCount(state$: Observable<RiskAssessmentState>): Observable<number> {
    return state$.select(s => s.currentRiskAssessmentSubstancesCount);
}
export function getCurrentRiskAssessmentSubstancesDataTableOptions(state$: Observable<RiskAssessmentState>): Observable<DataTableOptions> {
    return state$.select(s => isNullOrUndefined(s.currentRiskAssessmentSubstancesPagingInfo) ? new DataTableOptions(1, 10) : new DataTableOptions(s.currentRiskAssessmentSubstancesPagingInfo.PageNumber, s.currentRiskAssessmentSubstancesPagingInfo.PageSize));
}
export function getcoshhInventoryData(state$: Observable<RiskAssessmentState>): Observable<AeSelectItem<string>[]> {
    return state$.select(s => s.currentRiskAssessment && extractRACoshhInventoryToAeSelectItems(s.currentRiskAssessmentCoshhInventory));
}
export function getcoshhInventoryList(state$: Observable<RiskAssessmentState>): Observable<RACoshhInventory[]> {
    return state$.select(s => s.currentRiskAssessment && s.currentRiskAssessmentCoshhInventory);
}

export function getSelectedHazardsCount(state$: Observable<RiskAssessmentState>): Observable<number> {
    return state$.select(s => getSelectedHazaradCount(s.currentRiskAssessment));
}

export function getRiskAssessmentName(state$: Observable<RiskAssessmentState>): Observable<string> {
    return state$.select(s => s.riskAssessmentName);
}
export function getCurrentRiskAssessmentHazards(state$: Observable<RiskAssessmentState>): Observable<RiskAssessmentHazard[]> {
    return state$.select(s => s && s.currentRiskAssessment && extractActiveItemsByCategory(s.currentRiskAssessment.RAHazards, getCategory(s.currentRiskAssessment)));
}

export function getHazardsLoading(state$: Observable<RiskAssessmentState>): Observable<boolean> {
    return state$.select(s => s && s.currentRiskAssessment && s.hazardsLoading);
}

export function getRiskAssessmentHazardsData(state$: Observable<RiskAssessmentState>): Observable<Array<RiskAssessmentHazard>> {
    return state$.select(s => getSelectedHazarads(s.currentRiskAssessment));
}

export function getRiskAssessmentTasksData(state$: Observable<RiskAssessmentState>): Observable<TaskActivity[]> {
    return state$.select(s => s.currentRiskAssessment && s.currentRiskAssessment.RAFurtherControlMeasuresTasks);
}

export function getRiskAssessmentTasksListTotalCount(state$: Observable<RiskAssessmentState>): Observable<number> {
    return state$.select(s => s.tasksListTotalCount);
}

export function getRiskAssessmentTasksListPageInformation(state$: Observable<RiskAssessmentState>): Observable<DataTableOptions> {
    return state$.select(s => s.tasksListPagingInfo && new DataTableOptions(s.tasksListPagingInfo.PageNumber, s.tasksListPagingInfo.Count, s.tasksListApiRequest.SortBy.SortField, s.tasksListApiRequest.SortBy.Direction));
}

export function getRiskAssessmentTasksListLoadingStatus(state$: Observable<RiskAssessmentState>): Observable<boolean> {
    return state$.select(s => s.loading);
}

export function getRiskAssessmentTaskById(state$: Observable<RiskAssessmentState>): Observable<TaskActivity> {
    return state$.select(s => s.selectedRATask);
}

export function getCurrentRiskAssessmentTypeId(state$: Observable<RiskAssessmentState>): Observable<string> {
    return state$.select(s => s.riskAssessmentTypeId);
}

export function getRiskAssessmentDocument(state$: Observable<RiskAssessmentState>): Observable<Document> {
    return state$.select(s => s.riskAssessmentDocument);
}
export function getCurrentRiskAssessmentControls(state$: Observable<RiskAssessmentState>): Observable<RiskAssessmentControl[]> {
    return state$.select(s => s && s.currentRiskAssessment && extractActiveItems(s.currentRiskAssessment.RAControls));
}

export function getFrequentlyUsedControls(state$: Observable<RiskAssessmentState>): Observable<RiskAssessmentControl[]> {
    return state$.select(s => s && s.frequentlyUsedControls);
}

export function getSuggestedControls(state$: Observable<RiskAssessmentState>): Observable<RiskAssessmentControl[]> {
    return state$.select(s => s && s.suggestedControls);
}

export function getAllControls(state$: Observable<RiskAssessmentState>): Observable<{ data: Immutable.List<RiskAssessmentControl>, allControlsLoading: boolean }> {
    return state$.select(s => extractAllControlsResponse(s));
}

export function getAllControlsCount(state$: Observable<RiskAssessmentState>): Observable<number> {
    return state$.select(s => s && s.allControlsCount);
}

export function geRiskAssessmentReviewStatus(state$: Observable<RiskAssessmentState>): Observable<boolean> {
    return state$.select(s => s.raChangeStatus);
}

export function getHazardNotes(state$: Observable<RiskAssessmentState>): Observable<RAHazardCategoryText> {
    return state$.select(s => s.raHazardCategoryText && s.raHazardCategoryText.find(f => f.Category === HazardCategory.General && f.IsDeleted === false))
}

export function getROENotes(state$: Observable<RiskAssessmentState>): Observable<RAHazardCategoryText> {
    return state$.select(s => s.raHazardCategoryText && s.raHazardCategoryText.find(f => f.Category === HazardCategory.RoutesOfExposure && f.IsDeleted === false))
}

export function getControlsNotes(state$: Observable<RiskAssessmentState>): Observable<RAControlsCategoryText> {
    return state$.select(s => s.raControlsCategoryText && s.raControlsCategoryText.find(f => f.Category === ControlsCategory['COSHH Control'] && f.IsDeleted === false))
}