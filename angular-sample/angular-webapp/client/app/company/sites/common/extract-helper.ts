import { isNullOrUndefined } from 'util';
import { EmployeeMetadata } from './../../manage-departments/models/employee-metadata.model';
import { AeSelectItem } from './../../../atlas-elements/common/models/ae-select-item';
import { SiteAssignment } from '../models/site-assignments.model';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { Response } from '@angular/http';
import { Site } from '../models/site.model';
import * as Immutable from 'immutable';

export function extractSitesListData(response: Response): Site[] {
    return response.json().Entities as Site[];
}

export function extractSitesPagingInfo(response: Response): PagingInfo {
    return response.json().PagingInfo as PagingInfo;
}

export function extractSiteAssignmentsData(response: Response): SiteAssignment[] {
    return response.json() as SiteAssignment[];
}

export function extractAeSelectItemEmployee(employees: EmployeeMetadata[]): AeSelectItem<string>[] {
    return employees.map((item) => {
        if (!isNullOrUndefined(item.Name) && !isNullOrUndefined(item.Id)) {
            let siteName = ' -No Site';
            if (!isNullOrUndefined(item.SiteName)) {
                siteName = ' -' + item.SiteName;
            }
            let aeSelectItem = new AeSelectItem<string>(item.Name + siteName, item.Id, false);
            return aeSelectItem;
        }
    }).sort(function (a, b) {
        if (a.Text < b.Text)
            return -1;
        if (a.Text > b.Text)
            return 1;
        return 0;
    })
}