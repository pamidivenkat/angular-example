import { MockStoreProviderFactory } from '../../shared/testing/mocks/mock-store-provider-factory';
import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { SearchResult } from '../models/searchresult';
import { CompanySiteView } from '../models/company-site-view';
import { AtlasApiRequestWithParams, AtlasParams } from '../../shared/models/atlas-api-response';
import { AbsenceStatus } from '../../shared/models/lookup.models';
import { AeListComponent } from './../../atlas-elements/ae-list/ae-list.component';
import { AeListStyle } from '../../atlas-elements/common/ae-list-style.enum';
import {
    addOrUpdateAtlasParamValue,
    filterSearchResults,
    formatHoliayAbsenceNotification,
    getAeListItemsFromAtlasNotifications,
    getAtlasParamValueByKey,
    getCompanyStructure,
    getSiteStructure,
    getUnReadNotificationIds,
} from './extract-helpers';
import { AeListItem } from './../../atlas-elements/common/models/ae-list-item';
import { AtlasNotification } from './../models/notification';
import * as Immutable from 'immutable';

describe('base-layout-extract-helpers', () => {
    let atlasNotifications: AtlasNotification[];
    let immuAeList: Immutable.List<AeListItem>;
    let atlasParamsList: AtlasParams[];
    let companySiteViewArray: CompanySiteView[] = [];
    let allResults: SearchResult[];
    
        beforeEach(() => {
        atlasNotifications = MockStoreProviderFactory.getMockAtlasNotifications();
        allResults = MockStoreProviderFactory.getMockAtlasSearchResults();
        
        atlasParamsList = [new AtlasParams("employeesByLeaverFilter", "0"),
        new AtlasParams("pageNumber", "1"),
        new AtlasParams("pageSize", "10"),
        new AtlasParams("sortField", "asc"),
        new AtlasParams("FullName", "test employee")];

        let createdOnDate: Date = new Date();
        companySiteViewArray = [{ Id: "08F00B58-A9BD-4736-B5A4-81B354483AAA", Name: "Test company1", ParentId: "", ParentCompanyId: "", RootId: "08F00B58-A9BD-4736-B5A4-81B354483AAA", IsSite: true, CreatedOn: createdOnDate, ModifiedOn: createdOnDate, CreatedBy: "A4F6D4CA-3D56-43FB-89D7-083F9343F3BE", ModifiedBy: "A4F6D4CA-3D56-43FB-89D7-083F9343F3BE", IsDeleted: false, LCid: 1066, Version: "1.0" }
            , { Id: "6B7F2C30-D051-4301-AD73-72188E5637DA", Name: "Test company2", ParentId: "08F00B58-A9BD-4736-B5A4-81B354483AAA", ParentCompanyId: "08F00B58-A9BD-4736-B5A4-81B354483AAA", RootId: "08F00B58-A9BD-4736-B5A4-81B354483AAA", IsSite: false, CreatedOn: createdOnDate, ModifiedOn: createdOnDate, CreatedBy: "A4F6D4CA-3D56-43FB-89D7-083F9343F3BE", ModifiedBy: "A4F6D4CA-3D56-43FB-89D7-083F9343F3BE", IsDeleted: false, LCid: 1066, Version: "1.0" }
            , { Id: "2C78AA76-F45E-4698-9BC2-A83F65689EDA", Name: "Test company3", ParentId: "08F00B58-A9BD-4736-B5A4-81B354483AAA", ParentCompanyId: "08F00B58-A9BD-4736-B5A4-81B354483AAA", RootId: "08F00B58-A9BD-4736-B5A4-81B354483AAA", IsSite: false, CreatedOn: createdOnDate, ModifiedOn: createdOnDate, CreatedBy: "A4F6D4CA-3D56-43FB-89D7-083F9343F3BE", ModifiedBy: "A4F6D4CA-3D56-43FB-89D7-083F9343F3BE", IsDeleted: false, LCid: 1066, Version: "1.0" }]
    });
    it('should return modified holiday/absence title', () => {
        let holidayNotificationTitle = 'your leave Holiday request is approved';
        let modifiedTitle = formatHoliayAbsenceNotification(holidayNotificationTitle, []);
        expect(modifiedTitle).toEqual(holidayNotificationTitle.toLowerCase())
    });

    it('should return correct no of Ae list items and correct styles should be applied', () => {
        let immList = getAeListItemsFromAtlasNotifications(atlasNotifications, []);
        expect(immList.count()).toEqual(atlasNotifications.length);
        //should have same count with style unread and read
        let immlistReadCount = immList.filter(obj => obj.ItemType == AeListStyle.Read).count();
        let immlistUnReadCount = immList.filter(obj => obj.ItemType == AeListStyle.UnRead).count();

        let atlasNotifReadCount = atlasNotifications.filter(obj => obj.HasRead).length;
        let atlasNotifUnReadCount = atlasNotifications.filter(obj => !obj.HasRead).length;

        expect(immlistReadCount).toEqual(atlasNotifReadCount);
        expect(immlistUnReadCount).toEqual(atlasNotifUnReadCount);
    });

    it('returned Ae list items should have correct text be applied', () => {
        let immList = getAeListItemsFromAtlasNotifications(atlasNotifications, []);
        let hasAnyNonMatchingTextitemFound: boolean = false;
        atlasNotifications.forEach(atlasNotify => {
            let itemMatched: boolean = false;
            immList.forEach(obj => {
                if (atlasNotify.Title === obj.Text) {
                    itemMatched = true;
                }
            })
            if (!itemMatched)
                hasAnyNonMatchingTextitemFound = true;
        });
        expect(hasAnyNonMatchingTextitemFound).toEqual(false);
    });

    it('proper un read items should be returned', () => {
        let unreadids = getUnReadNotificationIds(atlasNotifications);
        let atlasNotifUnRead = atlasNotifications.filter(obj => !obj.HasRead);
        expect(atlasNotifUnRead.length).toEqual(unreadids.length);
        //check now if any of the returned id is in the read items 
        let hasAnyReadIdReturned: boolean = false;
        unreadids.forEach(i => {
            let unreadFound: boolean = false;
            atlasNotifUnRead.forEach(x => {
                if (x.Id === i)
                    unreadFound = true;
            });
            if (!unreadFound) {
                hasAnyReadIdReturned = true;
            }
        });
        expect(hasAnyReadIdReturned).toEqual(false);
    });

    it('should return requested param value details', () => {
        let mockKey = 'FullName';
        let mockValue = 'test employee';
        let returnAtlasParam = getAtlasParamValueByKey(atlasParamsList, mockKey);
        expect(returnAtlasParam).toEqual(mockValue);

    });

    it('should able to update requested param value details', () => {
        let mockKey = 'FullName';
        let mockValue = 'test employee1';
        let returnAtlasParam = addOrUpdateAtlasParamValue(atlasParamsList, mockKey, mockValue);
        expect(returnAtlasParam[4].Value).toEqual(mockValue);
    });
    
    it('should filter the company structure data ', () => {
        let result = getCompanyStructure(companySiteViewArray);
        let mockResult = companySiteViewArray.filter(m => m.IsSite === false);
        expect(result.length).toEqual(mockResult.length);
    });

    it('should filter the site structure data ', () => {
        let result = getSiteStructure(companySiteViewArray);
        let mockResult = companySiteViewArray.filter(m => m.IsSite === true);
        expect(result.length).toEqual(mockResult.length);
    });

    it('should filter the search results data', () => {
        let request: AtlasApiRequestWithParams;
        let atlasParam: AtlasParams[];
        atlasParam = [new AtlasParams("SearchTerm", "user"),
        new AtlasParams("SortBy", "4")]
        request = new AtlasApiRequestWithParams(1, 10, "Title", SortDirection.Ascending, atlasParam)

        let result = filterSearchResults(allResults, request);
        
        expect(result.list.length).toEqual(allResults.length);
        expect(result.totalCount).toEqual(allResults.length);
    });
});
