import { DocumentCategory } from '../models/document-category';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { DocumentSubCategory } from '../models/DocumentSubCategory';
import * as Immutable from 'immutable';
import { isNullOrUndefined } from 'util';
import { Site } from "../../calendar/model/calendar-models";

export function extractDocumentSubCategorySelectItems(documentSubCategories: DocumentSubCategory[]): Immutable.List<AeSelectItem<string>> {
    let aeSelectItems: Array<AeSelectItem<string>> = [];
    documentSubCategories.map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id, false);
        aeSelectItem.Childrens = null;
        aeSelectItems.push(aeSelectItem);

    });
    return Immutable.List(aeSelectItems);
}


export function extractDocumentCategorySelectItems(documentSubCategories: DocumentCategory[]): AeSelectItem<string>[] {
    return documentSubCategories.map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id, false);
        aeSelectItem.Childrens = null;
        return aeSelectItem;
    }).sort(function (a, b) {
        if (a.Text < b.Text)
            return -1;
        if (a.Text > b.Text)
            return 1;
        return 0;
    });
}

export function extractDocumentCategoryItems(jsonArray): DocumentCategory[] {
    return jsonArray.map(keyValuePair => {
        if (!isNullOrUndefined(keyValuePair)) {
            let category = new DocumentCategory();
            category.Id = keyValuePair.Id;
            category.Code = keyValuePair.Code;
            category.DocumentArea = keyValuePair.DocumentArea;
            category.IsDistributable = keyValuePair.IsDistributable;
            category.Name = keyValuePair.Name;
            category.OrderNumber = keyValuePair.OrderNumber;
            category.Service = keyValuePair.Service;

            return category;
        }
    });

}
export function extractSiteSelectItems(site: Site[]): AeSelectItem<string>[] {
    return site.map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.SiteNameAndPostcode, keyValuePair.Id, false);
        aeSelectItem.Childrens = null;
        return aeSelectItem;
    }).sort(function (a, b) {
        if (a.Text < b.Text)
            return -1;
        if (a.Text > b.Text)
            return 1;
        return 0;
    });
}