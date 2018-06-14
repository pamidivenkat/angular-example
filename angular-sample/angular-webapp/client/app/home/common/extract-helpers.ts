import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Response } from '@angular/http';
import * as Immutable from 'immutable';
import { isNullOrUndefined } from 'util';

import * as fromConstants from '../../shared/app.constants';
import { AeInformationBarItemType } from '../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { News } from '../models/news';
import { StatisticsInformation } from '../models/statistics-information';
import { WhatsNew } from '../models/whats-new';


export function extractStatisticsInformation(response: Response): Array<StatisticsInformation<string>> {
    let todaysOverViewItems: StatisticsInformation<string>[] = new Array();
    let body = Array.from(response.json().filter(obj => !isNullOrUndefined(obj)));
    body.map((value, i) => {
        let code = value['Code'];
        let count = value['Count'];
        let priority = value['Priority'];
        let contextData = value['ContextData'];
        if (processContextData(contextData, code, count)) {
            Array.from(contextData).map((val) => {
                var item = new StatisticsInformation<string>();
                item.Id = val['Key'];
                item.Code = code;
                item.Count = count;
                item.Data = val['Value'];
                item.Priority = priority;
                todaysOverViewItems.push(item)
            });
        } else {
            var statisticItem = new StatisticsInformation<string>();
            statisticItem.Id = "";
            statisticItem.Code = code;
            statisticItem.Count = count;
            statisticItem.Data = null;
            statisticItem.Priority = priority
            todaysOverViewItems.push(statisticItem);
        }
    });
    return todaysOverViewItems.sort(todaysOverViewItem => todaysOverViewItem.Priority);
}

function processContextData(contextData, code, count) {
    return !isNullOrUndefined(contextData) && (code == AeInformationBarItemType.Joiners
        || (code === AeInformationBarItemType.RiskAssessmentsDueThisWeek && count > 0)
        || (code === AeInformationBarItemType.ChecklistDueThisWeek && count > 0)
        || (code === AeInformationBarItemType.AccidentsPreviousWeek && count > 0)
        || (code === AeInformationBarItemType.TeamWorkAnniversary && count > 0)
        || (code === AeInformationBarItemType.TeamBirthdays && count > 0)
        || (code === AeInformationBarItemType.TeamOutOfOffice && count > 0)
        || (code == AeInformationBarItemType.Documents && count == 1)
        || (code == AeInformationBarItemType.HSHandbookService && count > 0)
        || (code == AeInformationBarItemType.HSTrainingService)
        || (code == AeInformationBarItemType.ELHandbookService && count > 0)
        || (code == AeInformationBarItemType.ELTrainingService)
    )
}

export function extractNewsData(response): Immutable.List<News> {
    let newsList = new Array<News>();
    response.Entities.map((item) => {
        let news = new News();
        news.CreatedOn = item.CreatedOn;
        news.Id = item.Id;
        news.Service = item.Service;
        news.Tip = item.Tip;
        news.Url = item.Url;
        news.Title = item.Title;

        newsList.push(news);

    });
    return Immutable.List(newsList);
}

export function extractTodaysOverviewStatisticsInformation(response: Response): Immutable.List<StatisticsInformation<string>> {
    let staticsItems = extractStatisticsInformation(response).filter((value, i) => {
        if (!isNullOrUndefined(value)) {
            let count = value['Count'];
            return (!isNullOrUndefined(count) && count > 0);
        }
        return false;
    })
    return Immutable.List(staticsItems);
}

export function extractServiceReportingStatisticsInformation(response: Response): Immutable.List<StatisticsInformation<string>> {
    let statisticItems = extractStatisticsInformation(response);
    return Immutable.List(statisticItems);
}

export function extractUnreadAndUserMaps(items: WhatsNew[], userId: string): WhatsNew[] {
    if (!isNullOrUndefined(items)) {
        items.map((item, key) => {
            let usermaps = item.WhatsNewUserMap.filter((f) => (f.IsRead === false && f.UserId === userId));
            items[key].WhatsNewUserMap = usermaps;
        })
    }
    return items;
}

export function replaceDocumentIdWithFileDownload(content: string, sanitizer: DomSanitizer, isSystem: boolean = false): SafeHtml {

    let splitString: string[] = content.split(fromConstants.v1AppUrl + '/document.atld?id=');
    let formattedContent = splitString[0];

    if (splitString.length > 1) {
        splitString.map((part, key) => {
            if (key > 0) {
                let imgId = part.substr(0, 36);

                formattedContent += '/filedownload?documentId=' + part.replace(imgId, imgId + (isSystem ? '&isSystem=true' : ''));
            }
        })
    }
    return sanitizer.bypassSecurityTrustHtml(formattedContent);
}