import { Action } from '@ngrx/store';

import { CheckListAssignment } from '../../checklist/models/checklist-assignment.model';
import { AtlasApiRequestWithParams, AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { type } from '../../shared/util';
import { CheckItem } from '../models/checkitem.model';
import { CheckListInstance } from '../models/checklist-instance.model';
import { Checklist } from '../models/checklist.model';
import { CompanyOrExampleOrArchivedChecklist } from '../models/company-example-archived.model';

export const ActionTypes = {
    SET_INITIAL_STATE: type('[Checklist] Set to initial checklist')
    , CHECKLIST_CLEAR: type('[Checklist] Clear current checklist')
    , TODAYS_OR_COMPLETE_INCOMPLETE_CHECKLIST_LOAD: type('[Checklist], load list of TodaysChecklist')
    , TODAYS_OR_COMPLETE_INCOMPLETE_CHECKLIST_LOAD_COMPLETE: type('[Checklist], load list of TodaysChecklist complete')
    , SCHEDULED_OR_ARCHIVED_CHECKLIST_LOAD: type('[Checklist], load scheduled or archived')
    , SCHEDULED_OR_ARCHIVED_CHECKLIST_LOAD_COMPLETE: type('[Checklist], load scheduled or archived complete')
    , COMPANY_OR_EXAMPLE_OR_ARCHIVED_CHECKLIST_LOAD: type('[Checklist], load company  or example or archived')
    , COMPANY_CHECKLIST_LOAD_COMPLETE: type('[Checklist], load company  checklist complete')
    , EXAMPLE_CHECKLIST_LOAD_COMPLETE: type('[Checklist], load example checklist complete')
    , EXAMPLE_ARCHIVED_CHECKLIST_LOAD_COMPLETE: type('[Checklist], load archived example checklist complete')
    , ARCHIVED_CHECKLIST_LOAD_COMPLETE: type('[Checklist], load Archived checklist  or example complete')
    , CHECKLIST_ITEMS_LIST_ON_LOAD_COMPLETE: type('[CheckListItems], load list of checklist items on load complete')
    , CHECKLIST_ITEM_ADD: type('[CheckListItems], Add new checklist item')
    , CHECKLIST_ITEM_UPDATE: type('[CheckListItems], Update checklist item')
    , CHECKLIST_ITEM_REMOVE: type('[CheckListItems], Remove checklist item')
    , LOAD_CHECKLIST_ASSIGNMENTS: type('[CheckListAssignment], load checklist assignments')
    , LOAD_CHECKLIST_ASSIGNMENTS_COMPLETE: type('[CheckListAssignment], load checklist assignments complete')
    , ADD_CHECKLIST_ASSIGNMENT: type('[CheckListAssignment], add checklist assignment')
    , UPDATE_CHECKLIST_ASSIGNMENT: type('[CheckListAssignment], update checklist assignment')
    , DELETE_CHECKLIST_ASSIGNMENT: type('[CheckListAssignment], delete checklist assignment')
    , FILTER_BY_NAME_ACTION: type('[Checklist] Filter with name')
    , FILTER_BY_WORKSPACE_ACTION: type('[Checklist] Filter with work space')
    , CHECKLIST_ADD: type('[CheckListAdd], add list of CheckList')
    , CHECKLIST_ADD_COMPLETE: type('[CheckListAdd] add list of CheckList complete')
    , CHECKLIST_LOAD: type('[CheckListItems] load list of checklist items')
    , CHECKLIST_LOAD_COMPLETE: type('[CheckListItems] load list of checklist items complete')
    , UPDATE_CHECKLIST: type('[Checklist] Update checklist')
    , UPDATE_CHECKLIST_COMPLETE: type('[Checklist] Update checklist complete')
    , COPY_CHECKLIST: type('[Checklist] Copy checklist')
    , REMOVE_CHECKLIST: type('[Checklist] Remove checklist')
    , ARCHIVE_REINSTATE_CHECKLIST: type('[Checklist] Archive checklist')
    , CHECKLIST_ACTION_ITEMS_LOAD: type('[Checklist], Load action checklist items')
    , CHECKLIST_ACTION_ITEMS_LOAD_COMPLETE: type('[Checklist], Load complete action checklist items')
    , CHECKLIST_ACTION_ITEMS_UPDATE: type('[Checklist], update action checklist items')
    , CHECKLIST_ACTION_ITEMS_UPDATE_COMPLETE: type('[Checklist], update complete action checklist items')
    , CHECKLIST_ACTION_ITEMS_DOCUMENT_UPLOAD_COMPLETE: type('[Checklist], document upload complete action checklist items')
    , CHECKLIST_ACTION_ITEMS_DOCUMENT_REMOVE: type('[Checklist], document remove action checklist items')
    , CHECKLIST_ACTION_ITEMS_DOCUMENT_REMOVE_COMPLETE: type('[Checklist], document remove complete action checklist items')
    , CHECKLIST_ACTION_ITEMS_UNLOAD: type('[Checklist], Unload action checklist items')
    , LOAD_CHECKLIST_STATS: type('[Checklist], Load checklist count items')
    , LOAD_CHECKLIST_STATS_COMPLETE: type('[Checklist], Load checklist count items complete')
    , NULLIFY_CHECKLIST_STATS: type('[Checklist], nullify checklist count items')
    , NULLIFY_CHECKLIST_GLOBAL_FILTER_PARAMS: type('[Checklist], nullify checklist filter params')

}
export class NullifyCheckLisGlobalFilterParams implements Action {
    type = ActionTypes.NULLIFY_CHECKLIST_GLOBAL_FILTER_PARAMS;
    constructor() {

    }
}
export class NullifyCheckListStatsAction implements Action {
    type = ActionTypes.NULLIFY_CHECKLIST_STATS;
    constructor() {

    }
}

export class CheckListClearAction implements Action {
    type = ActionTypes.CHECKLIST_CLEAR;
    constructor(public payload: string) {

    }
}

export class TodaysOrCompleteIncompleteChecklistLoadAction implements Action {
    type = ActionTypes.TODAYS_OR_COMPLETE_INCOMPLETE_CHECKLIST_LOAD;
    constructor(public payload: AtlasApiRequestWithParams) {

    }
}

export class TodaysOrCompleteIncompleteChecklistLoadCompleteAction implements Action {
    type = ActionTypes.TODAYS_OR_COMPLETE_INCOMPLETE_CHECKLIST_LOAD_COMPLETE;
    constructor(public payload: any) {

    }
}
export class CheckListAddAction implements Action {
    type = ActionTypes.CHECKLIST_ADD;
    constructor(public payload: Checklist) {

    }
}

export class CheckListAddCompleteAction implements Action {
    type = ActionTypes.CHECKLIST_ADD_COMPLETE;
    constructor(public payload: Checklist) {

    }
}

export class ScheduledOrArchivedChecklistLoadAction implements Action {
    type = ActionTypes.SCHEDULED_OR_ARCHIVED_CHECKLIST_LOAD;
    constructor(public payload: AtlasApiRequestWithParams) {

    }
}

export class ScheduledOrArchivedChecklistLoadCompleteAction implements Action {
    type = ActionTypes.SCHEDULED_OR_ARCHIVED_CHECKLIST_LOAD_COMPLETE;
    constructor(public payload: any) {

    }
}

export class CompanyOrExampleChecklistLoadAction implements Action {
    type = ActionTypes.COMPANY_OR_EXAMPLE_OR_ARCHIVED_CHECKLIST_LOAD;
    constructor(public payload: AtlasApiRequestWithParams) {

    }
}

export class LoadChecklistAssignments implements Action {
    type = ActionTypes.LOAD_CHECKLIST_ASSIGNMENTS;
    constructor(public payload: AtlasApiRequestWithParams) { }
}

export class LoadChecklistAssignmentsComplete implements Action {
    type = ActionTypes.LOAD_CHECKLIST_ASSIGNMENTS_COMPLETE;
    constructor(public payload: any) { }
}

export class CompanyChecklistLoadCompleteAction implements Action {
    type = ActionTypes.COMPANY_CHECKLIST_LOAD_COMPLETE;
    constructor(public payload: AtlasApiResponse<CompanyOrExampleOrArchivedChecklist>) {

    }
}

export class ExampleChecklistLoadCompleteAction implements Action {
    type = ActionTypes.EXAMPLE_CHECKLIST_LOAD_COMPLETE;
    constructor(public payload: AtlasApiResponse<CompanyOrExampleOrArchivedChecklist>) {

    }
}

export class ExampleArchivedChecklistLoadCompleteAction implements Action {
    type = ActionTypes.EXAMPLE_ARCHIVED_CHECKLIST_LOAD_COMPLETE;
    constructor(public payload: AtlasApiResponse<CompanyOrExampleOrArchivedChecklist>) {

    }
}

export class ArchivedChecklistLoadCompleteAction implements Action {
    type = ActionTypes.ARCHIVED_CHECKLIST_LOAD_COMPLETE;
    constructor(public payload: AtlasApiResponse<CompanyOrExampleOrArchivedChecklist>) {

    }
}
export class FilterByChecklistNameAction implements Action {
    type = ActionTypes.FILTER_BY_NAME_ACTION;
    constructor(public payload: string) {

    }
}
export class FilterByWorkSpaceAction implements Action {
    type = ActionTypes.FILTER_BY_WORKSPACE_ACTION;
    constructor(public payload: string) {

    }
}

export class ChecklistLoadAction implements Action {
    type = ActionTypes.CHECKLIST_LOAD;
    constructor(public payload: any) {

    }
}

export class ChecklistLoadCompleteAction implements Action {
    type = ActionTypes.CHECKLIST_LOAD_COMPLETE;
    constructor(public payload: any) {

    }
}

export class ChecklistItemAddAction implements Action {
    type = ActionTypes.CHECKLIST_ITEM_ADD;
    constructor(public payload: CheckItem) {

    }
}

export class ChecklistItemUpdateAction implements Action {
    type = ActionTypes.CHECKLIST_ITEM_UPDATE;
    constructor(public payload: CheckItem) {

    }
}

export class ChecklistItemRemoveAction implements Action {
    type = ActionTypes.CHECKLIST_ITEM_REMOVE;
    constructor(public payload: CheckItem) {

    }
}

export class ChecklistItemsListOnLoadCompleteAction implements Action {
    type = ActionTypes.CHECKLIST_ITEMS_LIST_ON_LOAD_COMPLETE;
    constructor(public payload: AtlasApiRequestWithParams) {

    }

}

export class CopyChecklistAction implements Action {
    type = ActionTypes.COPY_CHECKLIST;
    constructor(public payload: any) {

    }
}

export class RemoveChecklistAction implements Action {
    type = ActionTypes.REMOVE_CHECKLIST;
    constructor(public payload: Checklist) {

    }
}

export class ArchiveOrReinstateChecklistAction implements Action {
    type = ActionTypes.ARCHIVE_REINSTATE_CHECKLIST;
    constructor(public payload: Checklist) {

    }
}
export class ChecklistUpdateAction implements Action {
    type = ActionTypes.UPDATE_CHECKLIST;
    constructor(public payload: Checklist) {

    }
}

export class ChecklistUpdateCompleteAction implements Action {
    type = ActionTypes.UPDATE_CHECKLIST_COMPLETE;
    constructor(public payload: Checklist) {

    }
}

export class SetInitialStateAction implements Action {
    type = ActionTypes.SET_INITIAL_STATE;
    constructor(public payload: boolean) {

    }
}

export class AddAssignmentAction implements Action {
    type = ActionTypes.ADD_CHECKLIST_ASSIGNMENT
    constructor(public payload: CheckListAssignment) { }
}

export class UpdateAssignmentAction implements Action {
    type = ActionTypes.UPDATE_CHECKLIST_ASSIGNMENT
    constructor(public payload: CheckListAssignment) { }
}

export class DeleteAssignmentAction implements Action {
    type = ActionTypes.DELETE_CHECKLIST_ASSIGNMENT
    constructor(public payload: CheckListAssignment) { }
}

export class LoadChecklistActionItems implements Action {
    type = ActionTypes.CHECKLIST_ACTION_ITEMS_LOAD
    constructor(public payload: string) { }
}
export class LoadChecklistActionItemsComplete implements Action {
    type = ActionTypes.CHECKLIST_ACTION_ITEMS_LOAD_COMPLETE
    constructor(public payload: any) { }
}
export class updateChecklistActionItems implements Action {
    type = ActionTypes.CHECKLIST_ACTION_ITEMS_UPDATE
    constructor(public payload: any) { }
}
export class updateChecklistActionItemsComplete implements Action {
    type = ActionTypes.CHECKLIST_ACTION_ITEMS_UPDATE_COMPLETE
    constructor(public payload: any) { }
}
export class checklistActionItemsDocumentUploadComplete implements Action {
    type = ActionTypes.CHECKLIST_ACTION_ITEMS_DOCUMENT_UPLOAD_COMPLETE
    constructor(public payload: CheckListInstance) { }
}
export class checklistActionItemsDocumentRemove implements Action {
    type = ActionTypes.CHECKLIST_ACTION_ITEMS_DOCUMENT_REMOVE
    constructor(public payload: any) { }
}
export class checklistActionItemsDocumentRemoveComplete implements Action {
    type = ActionTypes.CHECKLIST_ACTION_ITEMS_DOCUMENT_REMOVE_COMPLETE
    constructor(public payload: any) { }
}
export class checklistActionItemsUnload implements Action {
    type = ActionTypes.CHECKLIST_ACTION_ITEMS_UNLOAD
    constructor() { }
}

export class LoadChecklistStatsAction implements Action {
    type = ActionTypes.LOAD_CHECKLIST_STATS;
    constructor(public payload: any) {
    }
}

export class LoadChecklistStatsCompleteAction implements Action {
    type = ActionTypes.LOAD_CHECKLIST_STATS_COMPLETE;
    constructor(public payload: AtlasApiResponse<any>) {
    }
}

export type Actions = TodaysOrCompleteIncompleteChecklistLoadAction
    | TodaysOrCompleteIncompleteChecklistLoadCompleteAction
    | ScheduledOrArchivedChecklistLoadAction
    | ScheduledOrArchivedChecklistLoadCompleteAction
    | CompanyOrExampleChecklistLoadAction
    | CompanyChecklistLoadCompleteAction
    | ExampleChecklistLoadCompleteAction
    | ArchivedChecklistLoadCompleteAction
    | FilterByChecklistNameAction
    | FilterByWorkSpaceAction
    | ChecklistItemAddAction
    | ChecklistItemUpdateAction
    | ChecklistItemRemoveAction
    | ChecklistItemsListOnLoadCompleteAction
    | ChecklistLoadAction
    | ChecklistLoadCompleteAction
    | ChecklistLoadAction
    | ChecklistLoadCompleteAction
    | FilterByChecklistNameAction
    | ChecklistItemAddAction
    | ChecklistItemUpdateAction
    | ChecklistItemRemoveAction
    | ChecklistItemsListOnLoadCompleteAction
    | ChecklistUpdateAction
    | ChecklistUpdateCompleteAction
    | LoadChecklistAssignments
    | LoadChecklistAssignmentsComplete
    | AddAssignmentAction
    | UpdateAssignmentAction
    | DeleteAssignmentAction
    | SetInitialStateAction
    | LoadChecklistActionItems
    | LoadChecklistActionItemsComplete
    | updateChecklistActionItems
    | updateChecklistActionItemsComplete
    | checklistActionItemsDocumentUploadComplete
    | checklistActionItemsDocumentRemove
    | checklistActionItemsDocumentRemoveComplete
    | LoadChecklistStatsAction
    | LoadChecklistStatsCompleteAction
    | NullifyCheckLisGlobalFilterParams

