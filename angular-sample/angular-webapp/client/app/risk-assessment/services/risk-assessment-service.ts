import { Injectable, EventEmitter } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { Document } from '../../document/models/document';
import { LoadStandardIconsAction } from '../../shared/actions/lookup.actions';
import { LoadRiskAssessmentTypesAction, UserLoadAction } from '../../shared/actions/lookup.actions';
import { TrainingCourseLoadAction } from '../../shared/actions/training-course.actions';
import * as fromConstants from '../../shared/app.constants';
import { RestClientService } from '../../shared/data/rest-client.service';
import { AtlasApiRequestWithParams } from '../../shared/models/atlas-api-response';
import * as fromRoot from '../../shared/reducers/index';
import { TaskActivity } from '../../task/models/task-activity';
import {
    ApproveRiskAssessmentAction,
    ArchivedRiskAssessmentAction,
    CopyRiskAssessmentAction,
    CreateHazardAction,
    CreateRaControlsCategoryText,
    CreateRaHazardCategoryText,
    CreateRiskAssessmentAction,
    CreateRiskAssessmentHazardAction,
    CreateRiskAssessmentRouteOfExposureAction,
    CreateRiskAssessmentTaskAction,
    DeleteRiskAssessmentAction,
    ExportRiskAssessmentsPreviewAction,
    FilterByRiskAssessmentNameAction,
    FilterByRiskAssessmentSectorAction,
    FilterByRiskAssessmentSiteAction,
    FilterByRiskAssessmentTypeAction,
    FilterByRiskAssessmentWorkSpaceAction,
    FilterRoutesOfExposureAction,
    LoadAdditionalControlsCategoryTextAction,
    LoadAdditionalControlsRiskAssessmentsListAction,
    LoadCoshhInventory,
    LoadExampleHazardsAction,
    LoadExampleRoutesOfExposureAction,
    LoadHazardsAction,
    LoadRAAdditionalControlsListAction,
    LoadRiskAssessmentAction,
    LoadRiskAssessmentCompleteAction,
    LoadRiskAssessments,
    LoadRiskAssessmentsInformationComponentAction,
    LoadRiskAssessmentTaskByIdAction,
    LoadRiskAssessmentTasksAction,
    LoadRoutesOfExposureByRiskAssessmentIdAction,
    ProceduresRiskAssessmentCreateAction,
    ProceduresRiskAssessmentUpdateAction,
    RemoveDocumentAction,
    RemoveRiskAssessmentHazardAction,
    RemoveRiskAssessmentRouteOfExposureAction,
    RemoveRiskAssessmentTaskAction,
    ReviewRiskAssessmentAction,
    SaveRAAdditionalControlsListAction,
    SaveRAAdditionalControlsTextAction,
    SetRiskAssessmentNameAction,
    SetRiskAssessmentTypeAction,
    UpdateRaControlsCategoryText,
    UpdateRaHazardCategoryText,
    UpdateRAPrintDescriptionStatusAction,
    UpdateRiskAssessmentAction,
    UpdateRiskAssessmentHazardAction,
    UpdateRiskAssessmentRouteOfExposureAction,
    UpdateRiskAssessmentTaskAction,
    LoadRiskAssessmentsCount,
} from '../actions/risk-assessment-actions';
import { RAControlsCategoryText } from '../models/ra-controls-category-text';
import { RAHazardCategoryText } from '../models/ra-hazard-category-text';
import { RiskAssessment } from '../models/risk-assessment';
import { RAAdditionalControl } from '../models/risk-assessment-additionalcontrols';
import { RiskAssessmentHazard } from '../models/risk-assessment-hazard';
import { RAProcedures } from '../models/risk-assessments-procedures';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';

@Injectable()
export class RiskAssessmentService {
    private _reloadRAListEvent: EventEmitter<boolean>;

    public get reloadRAListEvent() {
        return this._reloadRAListEvent;
    }

    constructor(private _store: Store<fromRoot.State>
        , private _data: RestClientService
        , private _claimsHelper: ClaimsHelperService) {
        this._reloadRAListEvent = new EventEmitter<boolean>();
    }

    _loadRiskAssessment(riskAssessmentId: string, isExample: boolean) {
        this._store.dispatch(new LoadRiskAssessmentAction({ id: riskAssessmentId, example: isExample }));
    }

    _loadRiskAssessmentComplete(riskAssessment: RiskAssessment) {
        this._store.dispatch(new LoadRiskAssessmentCompleteAction(riskAssessment));
    }

    _loadRiskAssessmentList(atlasApiRequestWithParams: AtlasApiRequestWithParams) {
        this._store.dispatch(new LoadRiskAssessments(atlasApiRequestWithParams));
    }

    _filterByRiskAssessmentName(name: string) {
        this._store.dispatch(new FilterByRiskAssessmentNameAction(name));
    }

    _filterByRiskAssessmentSite(name: string) {
        this._store.dispatch(new FilterByRiskAssessmentSiteAction(name));
    }

    _filterByRiskAssessmentType(name: string) {
        this._store.dispatch(new FilterByRiskAssessmentTypeAction(name));
    }
    _filterByRiskAssessmentWorkSpace(name: string) {
        this._store.dispatch(new FilterByRiskAssessmentWorkSpaceAction(name));
    }

    _filterByRiskAssessmentSector(name: string) {
        this._store.dispatch(new FilterByRiskAssessmentSectorAction(name));
    }

    _loadRiskAssessmentCounts() {
        this._store.dispatch(new LoadRiskAssessmentsCount({
            companyId: this._claimsHelper.getCompanyIdOrCid(),
            optional: 'optional'
        }));
    }

    _loadRiskAssessmentInformationComponent(_employeeId: string) {
        this._store.dispatch(new LoadRiskAssessmentsInformationComponentAction(_employeeId));
    }
    _loadRiskAssessmentTypes() {
        this._store.dispatch(new LoadRiskAssessmentTypesAction(true));
    }
    _createRiskAssessment(riskAssessment: RiskAssessment) {
        this._store.dispatch(new CreateRiskAssessmentAction(riskAssessment));
    }
    _updateRiskAssessment(riskAssessment: RiskAssessment) {
        this._store.dispatch(new UpdateRiskAssessmentAction(riskAssessment));
    }
    loadAdditionalControlTabList() {
        this._store.dispatch(new LoadAdditionalControlsRiskAssessmentsListAction(true));
    }
    loadAdditionalControlCategoryText(RAId: string) {
        this._store.dispatch(new LoadAdditionalControlsCategoryTextAction(RAId));
    }
    loadRAAdditionalControlList(RAId: string) {
        this._store.dispatch(new LoadRAAdditionalControlsListAction(RAId));
    }
    saveAdditionalControls(controls: RAAdditionalControl[]) {
        this._store.dispatch(new SaveRAAdditionalControlsListAction(controls));
    }
    saveAdditionalControlsText(text: any) {
        this._store.dispatch(new SaveRAAdditionalControlsTextAction(text));
    }
    _deleteRiskAssessment(riskAssessment: RiskAssessment) {
        this._store.dispatch(new DeleteRiskAssessmentAction(riskAssessment));
    }

    _archivedRiskAssessment(riskAssessment: RiskAssessment) {
        this._store.dispatch(new ArchivedRiskAssessmentAction(riskAssessment));
    }

    _approveRiskAssessment(riskAssessment: RiskAssessment) {
        this._store.dispatch(new ApproveRiskAssessmentAction(riskAssessment));
    }

    _loadHazards(filterData: any) {
        this._store.dispatch(new LoadHazardsAction(filterData));
    }
    _loadExampleHazards(filterData: any) {
        this._store.dispatch(new LoadExampleHazardsAction(filterData));
    }

    _removeDocument(document: Document) {
        this._store.dispatch(new RemoveDocumentAction(document));
    }

    _loadExampleRoutesOfExposure(filterData: any) {
        this._store.dispatch(new LoadExampleRoutesOfExposureAction(filterData));
    }

    _loadSelectedRoutesOfExposureByRAId(filterData: any) {
        this._store.dispatch(new LoadRoutesOfExposureByRiskAssessmentIdAction(filterData));
    }

    _loadFilteredExampleRoutesOfExposure(filteredText: string) {
        this._store.dispatch(new FilterRoutesOfExposureAction(filteredText));
    }

    _createRiskAssessmentROE(_roe: RiskAssessmentHazard) {
        this._store.dispatch(new CreateRiskAssessmentRouteOfExposureAction(_roe));
    }

    _updateRiskAssessmentROE(_roe: RiskAssessmentHazard) {
        this._store.dispatch(new UpdateRiskAssessmentRouteOfExposureAction(_roe));
    }

    _removeRiskAssessmentROE(_roe: RiskAssessmentHazard) {
        this._store.dispatch(new RemoveRiskAssessmentRouteOfExposureAction(_roe));
    }
    _loadcoshhInventory() {
        this._store.dispatch(new LoadCoshhInventory(true));
    }
    _createRiskAssessmentProcedures(riskAssessmentProcedures: RAProcedures) {
        this._store.dispatch(new ProceduresRiskAssessmentCreateAction(riskAssessmentProcedures));
    }
    _updateRiskAssessmentProcedures(riskAssessmentProcedures: RAProcedures) {
        this._store.dispatch(new ProceduresRiskAssessmentUpdateAction(riskAssessmentProcedures));
    }
    createRiskAssessmentHazard(raHazard: RiskAssessmentHazard) {
        this._store.dispatch(new CreateRiskAssessmentHazardAction(raHazard));
    }

    updateRiskAssessmentHazard(raHazard: RiskAssessmentHazard) {
        this._store.dispatch(new UpdateRiskAssessmentHazardAction(raHazard));
    }

    removeRiskAssessmentHazard(riskAssessmentHazardId: string) {
        this._store.dispatch(new RemoveRiskAssessmentHazardAction(riskAssessmentHazardId));
    }
    createHazard(hazard: RiskAssessmentHazard) {
        this._store.dispatch(new CreateHazardAction(hazard));
    }
    loadStandardHazardIcons() {
        this._store.dispatch(new LoadStandardIconsAction(true));
    }
    setRiskAssessmentName(riskAssessmentName: string) {
        this._store.dispatch(new SetRiskAssessmentNameAction(riskAssessmentName));
    }

    _loadRiskAssessmentTasks(_params: AtlasApiRequestWithParams) {
        this._store.dispatch(new LoadRiskAssessmentTasksAction(_params));
    }

    _loadTrainingCourses(isAtlasTraining: boolean) {
        this._store.dispatch(new TrainingCourseLoadAction(isAtlasTraining));
    }

    _loadUsersList() {
        this._store.dispatch(new UserLoadAction(true));
    }

    _createRATask(_task: TaskActivity) {
        this._store.dispatch(new CreateRiskAssessmentTaskAction(_task));
    }

    _updateRATask(_task: TaskActivity) {
        this._store.dispatch(new UpdateRiskAssessmentTaskAction(_task));
    }

    _removeRATask(_task: TaskActivity) {
        this._store.dispatch(new RemoveRiskAssessmentTaskAction(_task));
    }

    _loadSelectedRATask(_taskId: string) {
        this._store.dispatch(new LoadRiskAssessmentTaskByIdAction(_taskId));
    }

    setRiskAssessmentType(riskAssessmentTypeId: string) {
        this._store.dispatch(new SetRiskAssessmentTypeAction(riskAssessmentTypeId));
    }

    _copyRiskAssessment(_riskAssessment: RiskAssessment) {
        this._store.dispatch(new CopyRiskAssessmentAction(_riskAssessment));
    }

    checkIsExistingReferenceNumber(key: string): Observable<boolean> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('reference', key);
        params.set('isExample', 'false');
        return this._data.post('RiskAssessment', {}, { search: params })
            .map((res) => {
                return res.json().Status === false ? false : true;
            });
    }

    exportRiskAssessmentPreview(modal: any) {
        this._store.dispatch(new ExportRiskAssessmentsPreviewAction(modal));
    }

    reviewRiskAssesment(raArray: any) {
        this._store.dispatch(new ReviewRiskAssessmentAction(raArray));
    }

    updateRiskAssessmentPrintDescriptionStatus(modal: RiskAssessment, example: boolean) {
        this._store.dispatch(new UpdateRAPrintDescriptionStatusAction({ data: modal, example: example }));
    }

    createRiskAssessmentHazardCategoryText(params) {
        this._store.dispatch(new CreateRaHazardCategoryText(params));
    }

    updateRiskAssessmentHazardCategoryText(raHazardCategoryText: RAHazardCategoryText) {
        this._store.dispatch(new UpdateRaHazardCategoryText(raHazardCategoryText));
    }

    createRiskAssessmentControlsCategoryText(params) {
        this._store.dispatch(new CreateRaControlsCategoryText(params));
    }

    updateRiskAssessmentControlsCategoryText(raControlsCategoryText: RAControlsCategoryText) {
        this._store.dispatch(new UpdateRaControlsCategoryText(raControlsCategoryText));
    }

    isCOSHH(riskAssessment: RiskAssessment): boolean {
        return riskAssessment && (riskAssessment.RiskAssessmentTypeId === fromConstants.coshhRiskAssessmentTypeId || riskAssessment.RiskAssessmentTypeId === fromConstants.coshhMigratedRiskAssessmentTypeId);
    }

    isMigrated(riskAssessment: RiskAssessment): boolean {
        return riskAssessment && (riskAssessment.RiskAssessmentTypeId === fromConstants.coshhMigratedRiskAssessmentTypeId || riskAssessment.RiskAssessmentTypeId === fromConstants.generalMigratedRiskAssessmentTypeId);
    }

    getPictureUrl(pictureId: string, isSystemDocument: boolean = false, isHazard: boolean = false): string {
        if (isSystemDocument) {
            return pictureId && pictureId != "00000000-0000-0000-0000-000000000000" ? "/filedownload?documentId=" + pictureId + "&isSystem=true" : (isHazard ? "/assets/images/hazard-default.png" : "/assets/images/default-icon-32x32.png");
        } else {
            return pictureId && pictureId != "00000000-0000-0000-0000-000000000000" ? "/filedownload?documentId=" + pictureId : (isHazard ? "/assets/images/hazard-default.png" : "/assets/images/default-icon-32x32.png");
        }
    }
}