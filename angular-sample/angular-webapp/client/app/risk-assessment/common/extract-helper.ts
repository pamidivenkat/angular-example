import { RiskAssessmentState } from './../reducers/risk-assessment-reducer';
import { Response } from '@angular/http';
import * as Immutable from 'immutable';
import { isNullOrUndefined } from 'util';

import { DataTableOptions } from '../../atlas-elements/common/models/ae-datatable-options';
import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { Document } from '../../document/models/Document';
import { Hazard } from '../../risk-assessment/models/hazard';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { RiskAssessment } from '../models/risk-assessment';
import { RAAdditionalControl } from '../models/risk-assessment-additionalcontrols';
import { RiskAssessmentControl } from '../models/risk-assessment-control';
import { RACoshhInventory } from '../models/risk-assessment-coshh-inventory';
import { RiskAssessmentHazard } from '../models/risk-assessment-hazard';
import { RASubstance } from '../models/risk-assessment-substance';
import { AeSelectItem } from './../../atlas-elements/common/models/ae-select-item';
import { AeWizardStep } from './../../atlas-elements/common/models/ae-wizard-step';
import * as fromConstants from './../../shared/app.constants';
import { ControlsCategory } from './controls-category-enum';
import { HazardCategory } from "./hazard-category-enum";
import { ControlIconCategory } from '../../risk-assessment/icon-management/models/control-icon-category.enum';
import { HazardIconCategory } from '../../risk-assessment/icon-management/models/hazard-icon-category.enum';

export function mapRAKeyValuesToAeSelectItems(riskAssessments: RiskAssessment[]): AeSelectItem<string>[] {
    if (riskAssessments) {
        return riskAssessments.map((ra) => {
            let FullName = ra.Name + '-' + ra.SiteName;
            let aeSelectItem = new AeSelectItem<string>(FullName, ra.Id);
            return aeSelectItem
        })
    } else {
        return null;
    }
}

export function extractControlsByGroup(controls: RAAdditionalControl[]): Map<string, Array<RAAdditionalControl>> {
    let groupedControls = new Map<string, Array<RAAdditionalControl>>();
    if (!isNullOrUndefined(controls)) {
        controls.sort(function (a, b) {
            if (a.Category < b.Category) return -1;
            if (a.Category > b.Category) return 1;
            return 0;
        });
        controls.forEach((control) => {
            let category = ControlsCategory[control.Category];
            if (groupedControls.has(category)) {
                groupedControls.get(category).push(control);
            } else {
                groupedControls.set(category, [control]);
            }
        });
        controls.sort(function (a, b) {
            if (a.Name < b.Name) return -1;
            if (a.Name > b.Name) return 1;
            return 0;
        });
    }
    return groupedControls;
}

export function extractDocuments(riskAssessment: RiskAssessment): Immutable.List<Document> {
    let documents = [];
    if (!isNullOrUndefined(riskAssessment) && !isNullOrUndefined(riskAssessment.Documents)) {
        documents = riskAssessment.Documents.filter((document) => !document.IsDeleted).sort((a, b) => {
            return a.FileName > b.FileName ? 1 : -1;
        });
    }
    return Immutable.List<Document>(documents);
}
export function extractDocumentsWithPagging(riskAssessment: RiskAssessment): Immutable.List<Document> {
    if (isNullOrUndefined(riskAssessment) || isNullOrUndefined(riskAssessment.Documents)) return Immutable.List<Document>([])
    let totalRecords = Immutable.List<Document>(riskAssessment.Documents);
    let pageNumber = 1;
    let PageSize = 10;
    let startIndex = (pageNumber * PageSize) - PageSize;
    let endIndex = (pageNumber * PageSize);
    let pagedData = Immutable.List<Document>(totalRecords.slice(startIndex, endIndex));

    return Immutable.List<Document>(pagedData);
}
export function extractSubstanceWithPagging(riskAssessment: RiskAssessment): Immutable.List<RASubstance> {
    if (isNullOrUndefined(riskAssessment) || isNullOrUndefined(riskAssessment.RASubstances)) return Immutable.List<RASubstance>([])
    let totalRecords = Immutable.List<RASubstance>(riskAssessment.RASubstances.filter(m => !m.IsDeleted));
    let pageNumber = 1;
    let PageSize = 10;
    let startIndex = (pageNumber * PageSize) - PageSize;
    let endIndex = (pageNumber * PageSize);
    let pagedData = Immutable.List<RASubstance>(totalRecords.slice(startIndex, endIndex));

    return Immutable.List<RASubstance>(pagedData);
}


export function extractDocumentsLength(riskAssessment: RiskAssessment): number {
    let documents = extractDocuments(riskAssessment);
    return documents.size;
}

export function extractDataTableOptions(riskAssessment: RiskAssessment) {
    if (isNullOrUndefined(riskAssessment)) return new DataTableOptions(1, 10);
    return new DataTableOptions(1, 10);
}
export function extractDocumentPagingDataTableOptions(pagingInfo: DataTableOptions) {
    if (isNullOrUndefined(pagingInfo)) return new DataTableOptions(1, 10);
    return new DataTableOptions(pagingInfo.currentPage, pagingInfo.noOfRows);
}

export function extractPagingDataTableOptions(pagingInfo: PagingInfo) {
    if (isNullOrUndefined(pagingInfo)) return new DataTableOptions(1, 10);
    return new DataTableOptions(pagingInfo.PageNumber, pagingInfo.Count);
}

export function extractHazardsData(response: Response): RiskAssessmentHazard[] {
    if (!isNullOrUndefined(response)) {
        let _hazardTypes = response.json().Entities as RiskAssessmentHazard[];
        return _hazardTypes;
    }
}

export function extractRiskAssessmentListData(response: Response): Immutable.List<RiskAssessment> {
    let data = response.json().Entities as RiskAssessment[];
    return Immutable.List<RiskAssessment>(data);
}

export function extractRiskAssessmentListPagingInfo(response: Response): PagingInfo {
    return response.json().PagingInfo as PagingInfo;
}

export function extractHazardsDataFromResponse(responses: Response[]): Hazard[] {
    let _hazardTypes: Hazard[] = [];
    if (!isNullOrUndefined(responses)) {
        responses.forEach((response) => {
            _hazardTypes = _hazardTypes.concat(response.json().Entities as Hazard[]);
        })
        return _hazardTypes;
    }
}

export function extractHazardsTotalCount(responses: Response[]): number {
    let count = 0;
    if (!isNullOrUndefined(responses)) {
        responses.forEach((response) => {
            let apiResponse = <AtlasApiResponse<Hazard>>response.json();
            if (!isNullOrUndefined(apiResponse) && !isNullOrUndefined(apiResponse.PagingInfo) && apiResponse.PagingInfo.PageNumber === 1) {
                count += apiResponse.PagingInfo.TotalCount;
            }
        })
    }
    return count;
}
export function extractControlsTotalCount(responses: Response[]): number {
    let count = 0;
    if (!isNullOrUndefined(responses)) {
        responses.forEach((response) => {
            let apiResponse = <AtlasApiResponse<RiskAssessmentControl>>response.json();
            if (!isNullOrUndefined(apiResponse) && !isNullOrUndefined(apiResponse.PagingInfo) && apiResponse.PagingInfo.PageNumber === 1) {
                count += apiResponse.PagingInfo.TotalCount;
            }
        })
    }
    return count;
}
export function getHazardsCount(hazardCount: number, exampleHazardsCount: number): Map<string, number> {
    let count = new Map<string, number>();
    count.set('hazardsCount', hazardCount);
    count.set('exampleHazardsCount', exampleHazardsCount);
    return count;
}

export function getSelectedHazarads(riskAssessment: RiskAssessment): Array<RiskAssessmentHazard> {
    let selectedHazards = [];
    if (!isNullOrUndefined(riskAssessment)) {
        selectedHazards = extractActiveItemsByCategory(<Array<RiskAssessmentHazard>>riskAssessment.RAHazards, getCategory(riskAssessment));
    }
    return selectedHazards;
}

export function extractRACoshhInventoryToAeSelectItems(RACoshhInventoryList: RACoshhInventory[]): AeSelectItem<string>[] {
    if (RACoshhInventoryList) {
        return RACoshhInventoryList.map((coshh) => {
            let aeSelectItem = new AeSelectItem<string>(coshh.Substance, coshh.Id)
            return aeSelectItem
        })
    } else {
        return null;
    }
}

export function getRiskAssessmentWizardSteps(riskAssessmentTypeId: string, isExample: boolean = false): Immutable.List<AeWizardStep> {
    let isCoshh = (riskAssessmentTypeId === fromConstants.coshhRiskAssessmentTypeId || riskAssessmentTypeId === fromConstants.coshhMigratedRiskAssessmentTypeId);
    let wizardSteps = new Array<AeWizardStep>();
    wizardSteps.push(new AeWizardStep('General', '', 'general', false));
    if (isCoshh) {
        wizardSteps.push(new AeWizardStep('Substance', '', 'substance', true));
    }
    wizardSteps.push(new AeWizardStep('Hazards', '', 'hazards', true));
    if (isCoshh) {
        wizardSteps.push(new AeWizardStep('Routes of exposure', '', 'routesofexposure', true));
    }
    wizardSteps.push(new AeWizardStep('Controls', '', 'controls', true));
    if (isCoshh) {
        wizardSteps.push(new AeWizardStep('Further controls', '', 'furthercontrols', true))
    }
    wizardSteps.push(new AeWizardStep('Assess', '', 'assess', true));
    if (!isExample) {
        wizardSteps.push(new AeWizardStep('Further control measures', '', 'controlmeasures', true));
    }

    wizardSteps.push(new AeWizardStep('Operating procedures', '', 'operatingprocedures', true));
    wizardSteps.push(new AeWizardStep('Supporting evidence', '', 'supportingevidence', true));
    wizardSteps.push(new AeWizardStep('Preview', '', 'preview', true));

    return Immutable.List<AeWizardStep>(wizardSteps);
}

export function getSelectedHazaradCount(riskAssessment: RiskAssessment): number {
    let count = 0;
    let selectedHazards = getSelectedHazarads(riskAssessment);
    if (!isNullOrUndefined(selectedHazards)) {
        count = selectedHazards.length;
    }
    return count;
}

export function sortItemsByName(items: any[]): any[] {
    return items.sort((a, b) => a.Name.toLocaleLowerCase() > b.Name.toLocaleLowerCase() ? 1 : -1)
}

export function extractActiveItems(items: any[]): any[] {
    return sortItemsByName(items.filter((item) => item.IsDeleted === false));
}

export function extractAllHazardsResponse(s: RiskAssessmentState) {
    let res: any = {};
    if (!isNullOrUndefined(s)) {
        res.data = Immutable.List<Hazard>(s.HazardsList);
        res.allHazardsLoading = s.allHazardsLoading;
    }
    return res;
}


export function extractAllControlsResponse(s: RiskAssessmentState) {
    let res: any = {};
    if (!isNullOrUndefined(s)) {
        res.data = Immutable.List<RiskAssessmentControl>(s.allControlsList);
        res.allControlsLoading = s.allControlsLoading;
    }
    return res;
}

export function extractActiveItemsByCategory(items: any[], category: HazardCategory): any[] {
    return sortItemsByName(items.filter((item) => item.IsDeleted === false && item.Category === category));
}

export function combineControls(responses: Response[]) {
    let allControls: RiskAssessmentControl[] = [];
    responses.forEach((response) => {
        allControls = allControls.concat(response.json().Entities as RiskAssessmentControl[])
    })

    return allControls;
}


export function getCategory(riskAssessment: RiskAssessment): HazardCategory {
    let category: HazardCategory = HazardCategory.General;
    if (isNullOrUndefined(riskAssessment)) return category;
    let riskAssementTypeId: string = riskAssessment.RiskAssessmentTypeId.toLowerCase();
    switch (riskAssementTypeId) {
        case fromConstants.generalRiskAssessmentTypeId:
        case fromConstants.generalMigratedRiskAssessmentTypeId:
            category = HazardCategory.General;
            break;

        case fromConstants.coshhRiskAssessmentTypeId:
        case fromConstants.coshhMigratedRiskAssessmentTypeId:
            category = HazardCategory.Substance;
            break;
    }

    return category;
}



export function extractHazardOrControlsList(response: Response): Immutable.List<Hazard> {
    let hazardOrControlsList: Hazard[] = new Array();
    let body = response.json().Entities;
    if (!isNullOrUndefined(body)) {
        body.map(hacl => {
            let hazardOrControl = new Hazard();
            hazardOrControl.Id = hacl['Id'];
            hazardOrControl.Name = hacl['Name'];
            hazardOrControl.Description = hacl['Description'];
            hazardOrControl.PictureId = hacl['PictureId'];
            hazardOrControl.Category = hacl['Category'];
            hazardOrControl.IsExample = hacl['IsExample'];
            //  hazardOrControl.CategoryName = hacl['Category'];
            hazardOrControl.CreatedBy = hacl['FirstName'] + ' ' + hacl['LastName'];
            hazardOrControl.CreatedOn = hacl['CreatedOn'];
            hazardOrControl.ModifiedBy = hacl['modifierFirstName'] + ' ' + hacl['modifierLastName'];
            hazardOrControl.ModifiedOn = hacl['ModifiedOn'];
            hazardOrControl.Version = hacl['Version'];
            hazardOrControlsList.push(hazardOrControl);
        });
    }
    return Immutable.List<Hazard>(hazardOrControlsList);
}

export function extractPagingInfo(response: Response) {
    let body = response.json().PagingInfo as PagingInfo;
    return body;
}

export function getCategoryText(status: HazardIconCategory): string {
    switch (status) {
        case 0:
            return HazardIconCategory[0];
        case 1:
            return HazardIconCategory[1];
        case 2:
            return HazardIconCategory[2];
    }
    return '';
}


export function getControlCategoryText(status: ControlIconCategory): string {
    switch (status) {
        case 0:
            return ControlIconCategory[0];
        case 1:
            return ControlIconCategory[1];
        case 2:
            return ControlIconCategory[2];
        case 3:
            return ControlIconCategory[3];
        case 4:
            return ControlIconCategory[4];
    }
    return '';
}