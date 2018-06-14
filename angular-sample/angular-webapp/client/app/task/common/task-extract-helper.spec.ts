import { TaskActivity } from './../models/task-activity';
import { TasksView } from '../models/task';
import { MockStoreProviderTask } from './../../shared/testing/mocks/mock-store-provider-task';
import { TaskMocStoreProviderFactory } from "../../shared/testing/mocks/task-moc-store-provider-factory";
import { ResponseOptions } from "@angular/http";
import { fakeAsync, tick } from "@angular/core/testing";
import { extractTaskCategories, extractTaskCategorySelectItems, extractTasksList, extractAssignUsers } from "../../task/common/task-extract-helper";
import { AeSelectItem } from "../../atlas-elements/common/models/ae-select-item";
import { MockStoreProviderFactory } from "../../shared/testing/mocks/mock-store-provider-factory";
import { AtlasApiResponse } from "../../shared/models/atlas-api-response";
import { AssignUser } from "../../task/models/assign-user";

describe('task extract helper', () => {
    let data: any;
    let assignedUsers: any;
    let mokeupTasksList:any;
    beforeEach(() => {
        data = TaskMocStoreProviderFactory.getTaskCategories();
        assignedUsers = <AtlasApiResponse<AssignUser>>MockStoreProviderFactory.getUsersStub();
        mokeupTasksList =  MockStoreProviderTask.getTaskListStub();
    });

    it('should return task categories from the response', fakeAsync(() => {
        let taskCategories = extractTaskCategories(data);
        tick();
        expect(taskCategories.length).toEqual(11);
    }));

    it('should return task categories zero when response null', fakeAsync(() => {
        let taskCategories = extractTaskCategories(null);
        tick();
        expect(taskCategories.length).toEqual(0);
    }));

    it('should return array of AeSelectItem objects from task categories', () => {
        let taskCategories = extractTaskCategorySelectItems(data);
        taskCategories.forEach(category => {
            expect(category).toEqual(jasmine.any(AeSelectItem));
        });
    });

    it('should return select items from task categories', fakeAsync(() => {
        let taskCategories = extractTaskCategorySelectItems(data);
        tick();
        expect(taskCategories.length).toEqual(11);
    }));

    it('should return zero select items when task categories list empty', fakeAsync(() => {
        let taskCategories = extractTaskCategorySelectItems(null);
        tick();
        expect(taskCategories).toBeNull();
    }));

    it('should return user lists from the response', fakeAsync(() => {
        let usersList = extractAssignUsers(assignedUsers);
        tick();
        expect(usersList.length).toBeGreaterThan(0);
    }));

    it('should return user lists from the response', fakeAsync(() => {
        let usersList = extractAssignUsers(assignedUsers);
        tick();
        let taskList = extractTasksList(mokeupTasksList);
        expect(taskList instanceof TasksView);
    }));
})