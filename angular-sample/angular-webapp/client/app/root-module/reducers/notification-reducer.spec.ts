import { MockStoreProviderFactory } from '../../shared/testing/mocks/mock-store-provider-factory';
import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { AtlasApiResponse } from './../../shared/models/atlas-api-response';
import { reducer, NotificationState } from './notifications.reducer';
import { AeListComponent } from './../../atlas-elements/ae-list/ae-list.component';
import { AeListStyle } from '../../atlas-elements/common/ae-list-style.enum';
import { AeListItem } from './../../atlas-elements/common/models/ae-list-item';
import { AtlasNotification, NotificationMarkAsReadResponse } from './../models/notification';
import * as Immutable from 'immutable';


describe('notification-reducer', () => {
    let initalState: NotificationState;
    let atlasNotifications: AtlasNotification[];
    let immuAeList: Immutable.List<AeListItem>;
    let sampleResponse: AtlasApiResponse<AtlasNotification>;

    beforeEach(() => {
        atlasNotifications = MockStoreProviderFactory.getMockAtlasNotifications();
        sampleResponse = new AtlasApiResponse<AtlasNotification>();
        sampleResponse.Entities = atlasNotifications
        sampleResponse.OtherInfo = null;
        //count:number, totalCount:number, pageNumber:number, pageSize:number
        sampleResponse.PagingInfo = new PagingInfo(0, 14, 1, 16);

        initalState = {
            unReadNotificationsCount: 0,
            hasUnReadNotificationsLoaded: false,
            loadingNotifications: false,
            notifications: [],
            totalCount: 0,
            pageNumber: 0
        };

    });

    it('should return the default state', () => {
        const action = {} as any;
        const result = reducer(initalState, action);
        expect(result).toEqual(initalState);
    });

    it('should return current state when no valid actions have been made', () => {
        const actual = reducer(initalState, { type: 'INVALID_ACTION', payload: {} });
        const expected = initalState;
        expect(actual).toBe(expected);
    });

    it('should return correct values first store action Load Notification  unread count complete is despatched', () => {
        const actual = reducer(initalState, { type: '[Notification] Load Notification  unread count complete', payload: sampleResponse });
        expect(actual.hasUnReadNotificationsLoaded).toBe(true);
        expect(actual.unReadNotificationsCount).toEqual(sampleResponse.PagingInfo.TotalCount);
    });

    it('should return correct values first store action Load Notification items is despatched', () => {
        const actual = reducer(initalState, { type: '[Notification] Load Notification items complete', payload: sampleResponse });
        expect(actual.loadingNotifications).toBe(false);
        expect(actual.notifications).toEqual(sampleResponse.Entities);
        expect(actual.totalCount).toEqual(sampleResponse.PagingInfo.TotalCount);
        expect(actual.pageNumber).toEqual(sampleResponse.PagingInfo.PageNumber);
    });

    it('items returned from the API are arranged in sort order of has READ', () => {
        let orderedNotifications = Array.from(sampleResponse.Entities);
        orderedNotifications.sort(
            (x, y) => { return (x.HasRead === y.HasRead) ? 0 : !x.HasRead ? -1 : 1; }
        );
        const actual = reducer(initalState, { type: '[Notification] Load Notification items complete', payload: sampleResponse });
        expect(actual.loadingNotifications).toBe(false);
        //expect(actual.notifications).toEqual(sampleResponse.Entities);
        expect(actual.totalCount).toEqual(sampleResponse.PagingInfo.TotalCount);
        expect(actual.pageNumber).toEqual(sampleResponse.PagingInfo.PageNumber);
        expect(actual.notifications).toEqual(orderedNotifications);
        //assign this for futher processing 
        initalState = actual;
    });
    it('after mark as read response is returned state items should be updated to reflect the same', () => {
        let markAsReadResponse = new NotificationMarkAsReadResponse(["364F99D0-DA49-4435-81D8-FF01B737C858", "82830859-75D4-42CF-92E4-9C73518909A5"], 2, false);
       let modifiedStateAfterAPIResponse = reducer(initalState, { type: '[Notification] Load Notification items complete', payload: sampleResponse });    
        const actual = reducer(modifiedStateAfterAPIResponse, { type: '[Notification] Notification items mark as read complete', payload: markAsReadResponse });
        expect(actual.unReadNotificationsCount).toBe(markAsReadResponse.PendingCount);
        let allResponsdedItemsHasRead: boolean = true;
        markAsReadResponse.ReadIds.forEach(readId => {
            let updatedNotifcation = actual.notifications.find(obj => obj.Id == readId)
            if (!updatedNotifcation.HasRead)
                allResponsdedItemsHasRead = false;
        });
        expect(allResponsdedItemsHasRead).toEqual(true);
    });

    it('after mark as read response is returned with mark all as read then all state notifications should be updated as mark as read', () => {
        let markAsReadResponse = new NotificationMarkAsReadResponse(["364F99D0-DA49-4435-81D8-FF01B737C858", "82830859-75D4-42CF-92E4-9C73518909A5"], 0, true);
         let modifiedStateAfterAPIResponse = reducer(initalState, { type: '[Notification] Load Notification items complete', payload: sampleResponse });    
        const actual = reducer(modifiedStateAfterAPIResponse, { type: '[Notification] Notification items mark as read complete', payload: markAsReadResponse });
        expect(actual.unReadNotificationsCount).toBe(markAsReadResponse.PendingCount);
        let unReadItemsCount = actual.notifications.filter(obj => !obj.HasRead).length;
        expect(unReadItemsCount).toEqual(0);
    });

});