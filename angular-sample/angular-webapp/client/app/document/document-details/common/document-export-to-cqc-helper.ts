import { Response } from '@angular/http';
import { AeSelectItem } from "../../../atlas-elements/common/models/ae-select-item";
import { CQCStandards, CQCCategories } from "../../document-details/models/export-to-cqc-model";
import * as Immutable from 'immutable';
import { isNullOrUndefined } from "util";

export function extractCQCSelectOptionListData(response: Response): Immutable.List<AeSelectItem<string>> {
    let fileTypes = Array.from(response.json()) as any[];
    return Immutable.List<AeSelectItem<string>>(fileTypes.map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<number>(keyValuePair.name, keyValuePair.id, false);
        aeSelectItem.Childrens = null;
        return aeSelectItem;
    }));
}

export function extractCQCStandardsData(response: Response): CQCStandards[] {
    let stds: CQCStandards[] = new Array();
    let body = response.json();
    if (!isNullOrUndefined(body)) {
        body.map(std => {
            let standard = new CQCStandards();
            standard.Id = std['id'];
            standard.Title = std['title'];
            standard.Index = std['pca_index'];
            standard.IsSelected = false;
            stds.push(standard);
        });
    }
    return stds;
}

export function extractCQCCategoriesData(response: Response): CQCCategories[] {
    let cats: CQCCategories[] = new Array();
    let body = response.json();
    if (!isNullOrUndefined(body)) {
        body.map(std => {
            let cat = new CQCCategories();
            cat.CatId = std['id'];
            cat.CatName = std['name'];
            cat.CatIsSelected = false;

            cats.push(cat);
        });
    }
    return cats;
}


