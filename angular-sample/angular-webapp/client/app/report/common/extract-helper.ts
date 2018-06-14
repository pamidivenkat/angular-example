import { isNullOrUndefined } from 'util';
import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { Report } from '../models/report';
import { Response } from '@angular/http';
import * as Immutable from 'immutable';
import { AeInformationBarItem } from "../../atlas-elements/common/models/ae-informationbar-item";
import { IConHelper } from '../../shared/helpers/icon-helper';

export function extractReportList(response: Response): Immutable.List<Report> {
    let reports: Report[] = new Array();
    let body = response.json().Entities;
    if (!isNullOrUndefined(body)) {
        body.map(report => {
            let reportItem = new Report();
            reportItem.Id = report['Id'];
            reportItem.Name = report['Name'];
            reportItem.IsPublished = report['IsPublished'];
            reportItem.CategoryId = report['CategoryId'];
            reportItem.Version = report['Version'];
            reports.push(reportItem);
        });
    }
    return Immutable.List<Report>(reports);
}

export function extractPagingInfo(response: Response) {
    let body = response.json().PagingInfo as PagingInfo;
    return body;
}


export function extractReportsInformationBarItems(response: Response): AeInformationBarItem[] {

    let informationBarItems: AeInformationBarItem[] = [];
    let infoItem: AeInformationBarItem;
    let body = Array.from(response.json());
    body.map((value, i) => {
        if (value['Code'] != "0") {
            let count = value['Count'];
            if (value['Code'] == "28") {
                count = value['ContextData'].find(x => x.Key == 'Sick').Value;
            }
            infoItem = new AeInformationBarItem(value['Code'], count, value['Name'], false, IConHelper.GetByInformationBarItemTooltip(value['Code'], count), value['IconName']);
            infoItem.Priority = <number>value['Priority'];
            informationBarItems.push(infoItem);
        }
    });
    return informationBarItems.sort((first, second): number => {
        if (first.Priority < second.Priority) return -1;
        if (first.Priority > second.Priority) return 1; return 0;
    });
}