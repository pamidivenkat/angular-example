import { AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { isNullOrUndefined } from 'util';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { User } from '../models/bulk-password-reset.model'

import { Response } from '@angular/http';
import * as Immutable from 'immutable';
import { AeListItem } from '../../../atlas-elements/common/models/ae-list-item';

export function extractUserPagingInfo(response: Response): PagingInfo {
    let userPagingInfo = response.json().PagingInfo as PagingInfo;
    return userPagingInfo;
}

export function extractUserList(response: Response): User[] {
    let userList = response.json().Entities as User[];
    userList.forEach(usr => usr.IsSelect = false);
    return userList;
}