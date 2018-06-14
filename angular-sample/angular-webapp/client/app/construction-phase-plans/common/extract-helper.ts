import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { Response } from '@angular/http';
import { ConstructionPhasePlan } from '../models/construction-phase-plans';
import * as Immutable from 'immutable';

export function extractConstructionPhasePlansListData(response: Response): Immutable.List<ConstructionPhasePlan> {
    var cppEntities = response.json().Entities as ConstructionPhasePlan[];
    return Immutable.List(cppEntities);
}

export function extractConstructionPhasePlansPagingInfo(response: Response): PagingInfo {
    return response.json().PagingInfo as PagingInfo;
}

