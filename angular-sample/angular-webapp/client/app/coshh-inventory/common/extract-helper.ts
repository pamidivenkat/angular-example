import { isNullOrUndefined } from 'util';
import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { COSHHInventory } from '../models/coshh-inventory';
import { Response } from '@angular/http';
import * as Immutable from 'immutable';

export function extractCoshhInventoryList(response: Response): Immutable.List<COSHHInventory> {
    let coshhInventory: COSHHInventory[] = new Array();
    let body = response.json().Entities;
    if (!isNullOrUndefined(body)) {
        body.map(coshh => {
            let coshhItem = new COSHHInventory();
            coshhItem.Id = coshh['Id'];
            coshhItem.Substance = coshh['Substance'];
            coshhItem.ReferenceNumber = coshh['ReferenceNumber'];
            coshhItem.Manufacturer = coshh['Manufacturer'];
            coshhItem.Quantity = coshh['Quantity'];
            coshhInventory.push(coshhItem);
        });
    }
    return Immutable.List<COSHHInventory>(coshhInventory);
}

export function extractPagingInfo(response: Response) {
    let body = response.json().PagingInfo as PagingInfo;
    return body;
}