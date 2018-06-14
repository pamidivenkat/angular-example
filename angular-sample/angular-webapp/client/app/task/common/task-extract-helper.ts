import { TasksView } from '../models/task';
import { assign } from 'rxjs/util/assign';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { TaskCategory } from '../models/task-categoy';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { AssignUser } from '../models/assign-user';
import { Response } from '@angular/http';
import * as Immutable from 'immutable';
import { isNullOrUndefined } from 'util';
export function extractTaskCategories(entities: any): TaskCategory[] {
    if (isNullOrUndefined(entities)) return [];
    let taskCategories = Array.from(entities)
    return taskCategories.map((keyValuePair) => {
        let taskCaegory = new TaskCategory(keyValuePair['Id'], keyValuePair['Name']);
        return taskCaegory;
    });
}


//Users auto-complete list extract helper
export function extractAssignUsers(assignUsersResponse: AtlasApiResponse<AssignUser>): Array<AssignUser> {
    let users: Array<AssignUser> = assignUsersResponse.Entities.map(x => {
        x.FullName = x.FirstName + " " + x.LastName;
        return x;
    });
    return users;
}

export function extractTaskCategorySelectItems(taskCategories: TaskCategory[]): AeSelectItem<string>[] {
    if (isNullOrUndefined(taskCategories)) return null;
    return taskCategories.map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id, false);
        aeSelectItem.Childrens = null;
        return aeSelectItem;
    });
}

export function extractTasksList(response: Response): TasksView[] {
    let taskLists = response.json().Entities as TasksView[];
    return taskLists;
}