import { AbsenceStatus } from './../../shared/models/lookup.models';
import { StringHelper } from './../../shared/helpers/string-helper';
import { CommonHelpers } from './../../shared/helpers/common-helpers';
import { AtlasApiRequestWithParams } from './../../shared/models/atlas-api-response';
import { SearchResult } from './../models/searchresult';
import { AeListStyle } from '../../atlas-elements/common/ae-list-style.enum';
import { AeListItem } from '../../atlas-elements/common/models/ae-list-item';
import * as Immutable from 'immutable';
import { AtlasNotification } from './../../root-module/models/notification';
import { AtlasParams } from '../../shared/models/atlas-api-response';
import { isNullOrUndefined } from 'util';
import { CompanySiteView } from '../models/company-site-view';

export function formatHoliayAbsenceNotification(iniTitle: string, absenceStatuses: AbsenceStatus[]): string {
    let modifiedTitle: string;
    modifiedTitle = iniTitle;
    //Below is the hot fix for text change since the attributes are resolved from enum values of HolidayType and AbsenceStatus which are resolved
    // to Holiday/Absence & Approved/Declined
    modifiedTitle = modifiedTitle.replace('Holiday', 'holiday');
    modifiedTitle = modifiedTitle.replace('Absence', 'absence');
    if (!isNullOrUndefined(absenceStatuses) &&
        absenceStatuses.length > 0) {
        absenceStatuses.forEach(status => {
            modifiedTitle = modifiedTitle.replace(status.Name, status.Name.toLowerCase());
        });
    }
    return modifiedTitle;
}

export function getAeListItemsFromAtlasNotifications(atlasNotifications: AtlasNotification[], absenceStatuses: AbsenceStatus[]): Immutable.List<AeListItem> {
    if (atlasNotifications) {
        var listItems: AeListItem[] = [];
        atlasNotifications.forEach(notification => {
            var objAeitem = new AeListItem(notification);
            if (notification.RegardingObjectOtcType == "3723") {
                objAeitem.Text = formatHoliayAbsenceNotification(notification.Title, absenceStatuses);
            } else {
                objAeitem.Text = notification.Title;
            }
            objAeitem.IsClickable = notification.IsClickable;
            objAeitem.ItemType = notification.HasRead ? AeListStyle.Read : AeListStyle.UnRead;
            listItems.push(objAeitem);
        });
        return Immutable.List<AeListItem>(listItems);
    }
    return Immutable.List<AeListItem>();
}

export function getUnReadNotificationIds(allNotifications: AtlasNotification[]): Array<string> {
    var itemIds: string[] = [];
    allNotifications.forEach(notification => {
        if (!notification.HasRead)
            itemIds.push(notification.Id);
    });
    return itemIds;
}

export function getAtlasParamValueByKey(atlasParams: AtlasParams[], key: string): any {
    let filteredAtlasParams = atlasParams.filter(c => c.Key == key);
    if (!isNullOrUndefined(filteredAtlasParams) && filteredAtlasParams.length > 0)
        return filteredAtlasParams[0].Value;
    else
        return null;
}

export function addOrUpdateAtlasParamValue(atlasParams: AtlasParams[], key: string, value: any): AtlasParams[] {
    let filteredAtlasParams = atlasParams.filter(c => c.Key == key);
    if (!isNullOrUndefined(filteredAtlasParams) && filteredAtlasParams.length > 0)
        filteredAtlasParams[0].Value = value;
    else
        atlasParams.push(new AtlasParams(key, value));
    return atlasParams;
}

export function getCompanyStructure(data: Array<CompanySiteView>): Array<CompanySiteView> {
    let companyStructure;
    if (!isNullOrUndefined(data)) {
        companyStructure = data.filter(m => m.IsSite === false);
    }
    return companyStructure;
}

export function getSiteStructure(data: Array<CompanySiteView>): Array<CompanySiteView> {
    let siteStructure;
    if (!isNullOrUndefined(data)) {
        siteStructure = data.filter(m => m.IsSite === true);
    }
    return siteStructure;
}

export function filterSearchResults(allResults: SearchResult[],
    request: AtlasApiRequestWithParams): { totalCount: number, list: SearchResult[] } {
    let pagedList: SearchResult[] = [];
    pagedList = Array.from(allResults);
    let fitlerdCount: number;
    if (allResults && allResults.length > 0) {
        // fitler the results based on params
        let entityName: string = getAtlasParamValueByKey(request.Params, 'Entity');
        if (!StringHelper.isNullOrUndefinedOrEmpty(entityName)) {
            pagedList = pagedList.filter(obj => obj.EntityName.toLowerCase() == entityName.toLowerCase())
        }
        fitlerdCount = pagedList.length;
        pagedList = CommonHelpers.sortArray(pagedList, request.SortBy.SortField, request.SortBy.Direction);
        let startPage = (request.PageNumber * request.PageSize) - request.PageSize;
        let endPage = (request.PageNumber * request.PageSize);
        pagedList = pagedList.slice(startPage, endPage);
    }
    return { totalCount: fitlerdCount, list: pagedList };
}

