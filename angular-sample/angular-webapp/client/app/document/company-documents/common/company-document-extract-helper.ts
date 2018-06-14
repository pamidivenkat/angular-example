import { DocumentCategory } from './../../models/document-category';
import { isNullOrUndefined } from 'util';
import { AeSelectItem } from "./../../../atlas-elements/common/models/ae-select-item";
import * as Immutable from 'immutable';

export function extractDocumentCategorySelectItems(documentSubCategories: DocumentCategory[]): AeSelectItem<string>[] {
    return documentSubCategories.map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Code.toString(), false);
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

