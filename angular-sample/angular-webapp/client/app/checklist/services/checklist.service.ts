import { CheckListInstance } from '../models/checklist-instance.model';
import { isNullOrUndefined } from 'util';
import { WorkSpaceTypeLoadAction } from '../../shared/actions/lookup.actions';
import { CheckItem } from '../models/checkitem.model';
import { Checklist } from '../models/checklist.model';
import { AtlasApiRequestWithParams } from '../../shared/models/atlas-api-response';
import { AeSortModel } from '../../atlas-elements/common/models/ae-sort-model';
import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { Store } from '@ngrx/store';
import { Injectable, OnInit } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import {
    checklistActionItemsDocumentRemove,
    checklistActionItemsDocumentUploadComplete,
    checklistActionItemsUnload,
    CheckListAddAction,
    ChecklistLoadAction,
    ChecklistUpdateAction,
    LoadChecklistActionItems,
    LoadChecklistAssignments,
    SetInitialStateAction
} from '../actions/checklist.actions';
import {
    ArchiveOrReinstateChecklistAction,
    CompanyOrExampleChecklistLoadAction,
    FilterByChecklistNameAction,
    FilterByWorkSpaceAction,
    ScheduledOrArchivedChecklistLoadAction,
    TodaysOrCompleteIncompleteChecklistLoadAction,
    ChecklistItemAddAction,
    ChecklistItemRemoveAction,
    ChecklistItemsListOnLoadCompleteAction,
    CopyChecklistAction,
    RemoveChecklistAction,
    ChecklistItemUpdateAction,
    updateChecklistActionItems
} from '../actions/checklist.actions';
import { StringHelper } from "../../shared/helpers/string-helper";

@Injectable()
export class ChecklistService implements OnInit {

    constructor(private _store: Store<fromRoot.State>) { }

    ngOnInit() { }
    FilterByChecklistName(name: string) {
        this._store.dispatch(new FilterByChecklistNameAction(name));
    }
    FilterByWorkSpace(workspaces: string) {
        this._store.dispatch(new FilterByWorkSpaceAction(workspaces));
    }
    LoadWorkSpaceTypes() {
        this._store.dispatch(new WorkSpaceTypeLoadAction(true));
    }
    LoadTodaysChecklist(atlasApiRequestWithParams: AtlasApiRequestWithParams) {
        this._store.dispatch(new TodaysOrCompleteIncompleteChecklistLoadAction(atlasApiRequestWithParams));
    }
    LoadScheduledOrArchiveChecklist(atlasApiRequestWithParams: AtlasApiRequestWithParams) {
        this._store.dispatch(new ScheduledOrArchivedChecklistLoadAction(atlasApiRequestWithParams));
    }
    LoadCompanyOrExampleChecklist(companyApiRequestWithParams: AtlasApiRequestWithParams) {
        this._store.dispatch(new CompanyOrExampleChecklistLoadAction(companyApiRequestWithParams));
    }

    AddCheckItem(val: CheckItem) {
        this._store.dispatch(new ChecklistItemAddAction(val));
    }

    UpdateCheckItem(val: CheckItem) {
        this._store.dispatch(new ChecklistItemUpdateAction(val));
    }

    RemoveCheckItem(val: CheckItem) {
        this._store.dispatch(new ChecklistItemRemoveAction(val));
    }

    LoadCheckItemsList(atlasApiRequestWithParams: AtlasApiRequestWithParams) {
        this._store.dispatch(new ChecklistItemsListOnLoadCompleteAction(atlasApiRequestWithParams))
    }

    CopyChecklist(val: any) {
        this._store.dispatch(new CopyChecklistAction(val));
    }

    RemoveChecklist(val: Checklist) {
        this._store.dispatch(new RemoveChecklistAction(val));
    }

    ArchiveOrReinstateChecklist(val: Checklist) {
        this._store.dispatch(new ArchiveOrReinstateChecklistAction(val));
    }

    AddGeneralChecklist(generalFormData: Checklist) {
        this._store.dispatch(new CheckListAddAction(generalFormData));
    }

    UpdateChecklist(checklist: Checklist) {
        this._store.dispatch(new ChecklistUpdateAction(checklist));
    }

    LoadChecklist(payload: any) {
        this._store.dispatch(new ChecklistLoadAction(payload));
    }

    SetInitialState() {
        this._store.dispatch(new SetInitialStateAction(true));
    }

    getSiteName(siteName: string, siteLocation: string): string {
        if (!isNullOrUndefined(siteLocation) && !StringHelper.isNullOrUndefinedOrEmpty(String(siteLocation))) return siteLocation;
        if (!isNullOrUndefined(siteName) && !StringHelper.isNullOrUndefinedOrEmpty(String(siteName))) return siteName;
        return "All sites";
    }

    LoadChecklistAssignments(apiParams: AtlasApiRequestWithParams) {
        this._store.dispatch(new LoadChecklistAssignments(apiParams))
    }
    loadChecklistActions(payLoad: any) {
        this._store.dispatch(new LoadChecklistActionItems(payLoad))
    }
    updateChecklistActions(checkListInstance: CheckListInstance) {
        this._store.dispatch(new updateChecklistActionItems(checkListInstance))
    }
    checklistActionItemsDocumentUpload(checkListInstance: CheckListInstance) {
        this._store.dispatch(new checklistActionItemsDocumentUploadComplete(checkListInstance));
    }
    checklistActionItemsDocumentStartRemove(payLoad: any) {
        this._store.dispatch(new checklistActionItemsDocumentRemove(payLoad));
    }
    checklistActionItemsDestroy() {
        this._store.dispatch(new checklistActionItemsUnload());
    }

}