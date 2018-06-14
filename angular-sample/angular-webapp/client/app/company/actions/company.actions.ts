import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';


import { Actions, toPayload } from '@ngrx/effects';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from '../../shared/models/atlas-api-response';

import {
    Company
} from '../models/company';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';
import * as Immutable from 'immutable';


export const ActionTypes = {
    COMPANY_LOAD_DATA: type('[Company] load company'),
    COMPANY_LOAD_DATA_COMPLETE: type('[Company] load company complete'),
    COMPANY_INFORMATION_COMPONENT: type('[Company] load company information data'),
    COMPANY_INFORMATION_COMPONENT_COMPLETE: type('[Company] load company information data complete'),
    UPLOAD_COMPANY_LOGO: type('[Company] upload company logo'),
    UPLOAD_COMPANY_LOGO_COMPLETE: type('[Company] upload company logo complete')
}

export class CompanyLoadAction implements Action {
    type = ActionTypes.COMPANY_LOAD_DATA;
    constructor(public payload?: string) {
    }
}

export class CompanyLoadCompleteAction implements Action {
    type = ActionTypes.COMPANY_LOAD_DATA_COMPLETE;
    constructor(public payload: any) {
    }
}

export class CompanyInformationComponentAction implements Action {
    type = ActionTypes.COMPANY_INFORMATION_COMPONENT;
    constructor(public payload: string) {

    }
}

export class CompanyInformationComponentCompleteAction implements Action {
    type = ActionTypes.COMPANY_INFORMATION_COMPONENT_COMPLETE;
    constructor(public payload: AeInformationBarItem[]) {
    }

}
export class UploadCompanyLogoAction implements Action {
    type = ActionTypes.UPLOAD_COMPANY_LOGO;
    constructor(public payload: any) {
    }
}
export class UploadCompanyLogoCompleteAction implements Action {
    type = ActionTypes.UPLOAD_COMPANY_LOGO_COMPLETE;
    constructor() {
    }
}