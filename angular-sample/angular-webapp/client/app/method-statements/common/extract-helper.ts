import { PPECategoryGroup, PPECategory } from '../../shared/models/lookup.models';
import { URLSearchParams, Response } from '@angular/http';
import * as Immutable from 'immutable';
import { isNullOrUndefined } from 'util';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { RiskAssessment } from '../../risk-assessment/models/risk-assessment';
import { MSOtherRiskAssessments, MSRiskAssessment } from '../../method-statements/models/method-statement';


export function getSortedData(data: PPECategoryGroup[]) {
    let item: PPECategoryGroup[];

    item = data.sort(function (a, b) {
        if (a.Name < b.Name) return -1;
        if (a.Name > b.Name) return 1;
        return 0;
    });

    item.map(group => {
        group.PPECategories.sort(function (a, b) {
            if (a.Name < b.Name) return -1;
            if (a.Name > b.Name) return 1;
            return 0;
        });
    });
    return item;
}



export function extractMSRiskAssessments(fromLibray: RiskAssessment[], otherRA: MSOtherRiskAssessments[]): MSRiskAssessment[] {
    let list: MSRiskAssessment[] = [];
    if (fromLibray) {
        fromLibray.forEach(res => {
            if (res) {
                list.push({ Id: res.Id, Name: res.Name, ReferenceNumber: res.ReferenceNumber, type: 'library' })
            }
        });
    }
    if (otherRA) {
        otherRA.forEach(res => {
            if (res) {
                list.push({ Id: res.Id, Name: res.Name, ReferenceNumber: res.ReferenceNumber, type: 'other' })
            }
        });
    }
    return list;
}
