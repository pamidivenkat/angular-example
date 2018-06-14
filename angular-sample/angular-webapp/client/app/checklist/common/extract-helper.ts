import { CheckListInstance } from '../models/checklist-instance.model';
import { ChecklistWorkspaceTypes } from '../models/checklistworkspacetypes.model';
import { CheckItem } from '../models/checkitem.model';
import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { Response } from '@angular/http';
import { Checklist } from '../models/checklist.model';
import { isNullOrUndefined } from 'util';
import { CheckListAssignment } from "./../models/checklist-assignment.model";
import { Document } from '../../document/models/document';
import { Periodicity } from './periodicity.enum';

export function extractChecklistListData(response: Response): Checklist[] {
    return response.json().Entities as Checklist[];
}

export function extractChecklistPagingInfo(response: Response): PagingInfo {
    return response.json().PagingInfo as PagingInfo;
}

export function extractWorkspaceTypesData(response: Response): ChecklistWorkspaceTypes[] {
    let workspaceTypes = response.json().Entities as ChecklistWorkspaceTypes[];
    return workspaceTypes;
}
export function extractCheckItemsData(response: Response): CheckItem[] {
    if (!isNullOrUndefined(response.json())) {
        let _checkItems = response.json().CheckItems as CheckItem[];
        if (isNullOrUndefined(_checkItems)) return [];
        return _checkItems.filter((_ci) => {
            return _ci.IsDeleted != true;
        });
    }
}

export function extractAssignmentsData(response: Response): CheckListAssignment[] {
    return response.json().Entities as CheckListAssignment[];
}

export function extractAssignmentsPagingInfo(response: Response): PagingInfo {
    return response.json().PagingInfo as PagingInfo;
}
export function extractActionItemsWithAttachments(response: CheckListInstance): CheckListInstance {
    let uploadedAttachments = response.Attachments;
    let AttachedDocuments = new Map<string, Document[]>();
    if (uploadedAttachments) {
        for (let key in uploadedAttachments) {
            AttachedDocuments.set(key, uploadedAttachments[key])
        }
        response.Attachments = AttachedDocuments;
    }
    return response;
}
export function extractFrequencyOfChecklist(periodicity: Periodicity): string {
    let frequency: string;
    switch (periodicity) {
        case Periodicity.Annual:
            frequency = "Annual";
            break;
        case Periodicity.SemiAnnual:
            frequency = "Semi annual";
            break;
        case Periodicity.Quarterly:
            frequency = "Quarterly";
            break;
        case Periodicity.Monthly:
            frequency = "Monthly";
            break;
        case Periodicity.Weekly:
            frequency = "Weekly";
            break;
        case Periodicity.Daily:
            frequency = "Daily";
            break;
        default:
            frequency = "None";
            break;
    }
    return frequency;
}