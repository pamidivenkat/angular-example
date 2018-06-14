import { AuditLog } from '../models/audit-log.model';
import { UserPermissionsGroup } from '../models/user-permissions-group';
import { UserPermission, UserProfilesViewVm } from '../models/user-permissions-view-vm';
import { DropDownItem } from '../../../employee/models/dropdown-item';
import { AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { isNullOrUndefined } from 'util';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { User, UserAvailability } from '../models/user.model';

import { Response } from '@angular/http';
import * as Immutable from 'immutable';
import { AeListItem } from '../../../atlas-elements/common/models/ae-list-item';

export function extractUserPagingInfo(response: Response): PagingInfo {
    let userPagingInfo = response.json().PagingInfo as PagingInfo;
    return userPagingInfo;
}

export function extractUserList(response: Response): User[] {
    let userList = response.json().Entities as User[];
    return userList;
}

export function extractAcnOptionListData(response: Response): Array<any> {
    let data = Array.from(response.json());
    return data.map(item => {
        return { CardNumber: item['CardNumber'], Id: item['Id'] };
    });
}

export function extractAuditLogData(response: Response): AuditLog[] {
    let list = response.json();
    let logData = list.slice(0, list.length - 1);
    return logData;
}


/**
 * check for user Availability
 * @export
 * @param {Response} response
 * @returns {boolean} return is valid 
 */
export function extractAvailability(response: Response): boolean {
    let data = response.json();
    if (!isNullOrUndefined(data) && (data.Availability == UserAvailability.Available || data.Availability == UserAvailability.UserDeleted)) {
        return true;
    } else {
        return false;
    }
}

export function extractPermissionsData(response: Response): any {
    let data = response.json();
    let permissionGroups: Array<UserPermissionsGroup> = new Array();
    if (isNullOrUndefined(data)) permissionGroups;
    data.forEach(entity => {
        let group: UserPermissionsGroup = {
            Id: entity.GroupId,
            Name: entity.GroupName,
            Permissions: new Array<UserPermission>()
        };
        if (isNullOrUndefined(entity.Permissions)) return permissionGroups;
        entity.Permissions.forEach(permission => {
            group.Permissions.push({
                Id: permission.Id,
                Name: permission.Name,
                Description: permission.Description
            });
        });
        permissionGroups.push(group);
    });
    return permissionGroups;
}

export function extractUserPermissionsViewVm(response: Response): UserProfilesViewVm {
    let data = response.json();
    let userPermissionVm: UserProfilesViewVm = new UserProfilesViewVm();
    userPermissionVm.UserProfiles = data.UserProfiles;

    data.UserProfiles.forEach(element => {
        let userRolesVm = userPermissionVm.UserRoles;
        if (!isNullOrUndefined(element)) {
            userPermissionVm.UserId = element.Id;
            userRolesVm.push(element.Name);
        }
    });

    data.Permissions.forEach(element => {
        let permissionName: string = element.Name;
        let permissionGroupName = "No Group";
        let permissionDescription = element.Description;
        let permissionId = element.Id;
        if (!isNullOrUndefined(element.PermissionsGroup)) {
            permissionGroupName = element.PermissionsGroup.Name;
        }
        let permission = new UserPermission();
        permission.Name = permissionName;
        permission.Description = permissionDescription;
        permission.Id = permissionId;
        if (userPermissionVm.Permissions.has(permissionGroupName)) {
            let permissionNames = userPermissionVm.Permissions.get(permissionGroupName);
            permissionNames.push(permission);
        } else {
            userPermissionVm.Permissions.set(permissionGroupName, [permission]);
        }
    });
    return userPermissionVm;
}

