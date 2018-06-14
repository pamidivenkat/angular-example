import * as Immutable from 'immutable';
import { isNullOrUndefined } from 'util';

import { DataTableOptions } from '../../atlas-elements/common/models/ae-datatable-options';
import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { WhatsNew, WhatsNewCategory } from '../../home/models/whats-new';
import { Article } from '../models/article';
import { HelpArea } from '../models/helpArea';

export function getArticle(res: any): Article {
    let article: Article;
    if (!isNullOrUndefined(res)) {
        article = <Article>res[0].json();
        article.Id = res[1];
    }
    return article
}
export function extractDataTableOptions(pagingInfo: PagingInfo) {
    if (isNullOrUndefined(pagingInfo)) return new DataTableOptions(1, 10);
    return new DataTableOptions(pagingInfo.PageNumber, pagingInfo.Count);
}
export function extractHealpAreaToAeSelectItems(HelpAreaList: Immutable.List<HelpArea>): AeSelectItem<string>[] {
    if (HelpAreaList) {
        let HelpAreaArr = HelpAreaList.toArray();
        return HelpAreaArr.map((helpArea) => {
            let aeSelectItem = new AeSelectItem<string>(helpArea.Name, helpArea.Id)
            return aeSelectItem
        })
    } else {
        return null;
    }
}

export function clearTime(date : Date): Date {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    return date;
}