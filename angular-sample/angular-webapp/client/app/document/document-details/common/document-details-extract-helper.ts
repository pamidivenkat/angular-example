import { sharedDocument } from '../../usefuldocuments-templates/models/sharedDocument';
import { DocumentCategory } from '../../models/document-category';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import * as Immutable from 'immutable';
import { DocumentDetails } from '../../../document/document-details/models/document-details-model';
import { isNullOrUndefined } from "util";
import { Response } from '@angular/http';
import * as differenceInDays from 'date-fns/difference_in_days';
import { StringHelper } from './../../../shared/helpers/string-helper';

export function extractDocumentDetails(response: Response): DocumentDetails {
    let docDetails = response.json();
    let extractedDocDetails: DocumentDetails = new DocumentDetails();
    if (!isNullOrUndefined(docDetails)) {
        extractedDocDetails = Object.assign(extractedDocDetails, docDetails); //All details are necessary to update document
        extractedDocDetails.Id = docDetails.Id;
        // document related fields
        extractedDocDetails.CategoryLocalizedName = docDetails.CategoryLocalizedName ? docDetails.CategoryLocalizedName : (!isNullOrUndefined(docDetails.Categories) ? getCateoryNames(docDetails.Categories) : getCategoryName(docDetails.Category));
        extractedDocDetails.FileName = (!isNullOrUndefined(docDetails.FileNameAndTitle) && docDetails.FileNameAndTitle != '') ? docDetails.FileNameAndTitle : docDetails.FileName;
        extractedDocDetails.Notes = docDetails.Comment;
        extractedDocDetails.Description = isNullOrUndefined(docDetails.Description) ? 'Not mentioned' : docDetails.Description;
        extractedDocDetails.Title = docDetails.Title;
        extractedDocDetails.ExpiryDate = docDetails.ExpiryDate;
        extractedDocDetails.Archived = docDetails.IsArchived ? 'Yes' : 'No';
        extractedDocDetails.IsArchived = docDetails.IsArchived;
        extractedDocDetails.ModifiedOn = docDetails.ModifiedOn;
        extractedDocDetails.Usage = docDetails.Usage;
        extractedDocDetails.UsageName = docDetails.UsageName;
        extractedDocDetails.ModifiedByName = !isNullOrUndefined(docDetails.Modifier) &&
            !StringHelper.isNullOrUndefinedOrEmpty(docDetails.Modifier.FullName)
            ? docDetails.Modifier.FullName
            : '';
        extractedDocDetails.LastUpdatedDays = differenceInDays(Date.now(), docDetails.ModifiedOn)
        extractedDocDetails.CreatedOn = docDetails.CreatedOn;
        extractedDocDetails.RegardingObjectId = docDetails.RegardingObject && docDetails.RegardingObject.ObjectTypeCode != 3 ? docDetails.RegardingObject.Id : null;
        extractedDocDetails.SiteId = docDetails.RegardingObject && docDetails.RegardingObject.ObjectTypeCode == 3 ? docDetails.RegardingObject.Id : null; // object type ==3 for site
        extractedDocDetails.FileStorageIdentifier = docDetails.FileStorageIdentifier;
        extractedDocDetails.Category = docDetails.Category;

        // additional shared document related fields

        extractedDocDetails.Keywords = docDetails.Keywords;
        extractedDocDetails.Service = !isNullOrUndefined(docDetails.Categories)
            ? getServiceNames(docDetails.Categories)
            : '';
        extractedDocDetails.Sector = docDetails.Sector ? docDetails.Sector : 'All';
        extractedDocDetails.Country = docDetails.Countries ? docDetails.Countries.map(res => res.Name).join(',') : 'All';
        extractedDocDetails.Version = docDetails.Version;
        // extractedDocDetails.Id = docDetails.Id;
        extractedDocDetails.IsDistributable = docDetails.IsDistributable;

    }
    return extractedDocDetails;
}

export function getAllDistributedToOptions(): Immutable.List<AeSelectItem<string>> {
    return Immutable.List<AeSelectItem<string>>([new AeSelectItem<string>('All employees in the company', '1'), new AeSelectItem<string>('Site', '3'), new AeSelectItem<string>('Employee group', '4018'), new AeSelectItem<string>('Department or team', '4'), new AeSelectItem<string>('Employee', '17')]);
}

export function mapYearsLookupTableToAeSelectItems(dataSource: AeSelectItem<number>[]): Immutable.List<AeSelectItem<number>> {
    let aeSelectList = Immutable.List(dataSource.map((item) => {
        let ee = new AeSelectItem<number>(item.Text, item.Value, false);
        return ee;
    }));
    return aeSelectList;
}

export function getCategoryName(category: DocumentCategory): string {
    let categoryName: string = '';
    if (!isNullOrUndefined(category)) {
        categoryName = category.Name;
    }
    return categoryName;
}

export function getCateoryNames(categories: sharedDocument[]): string {
    let categoryNames: string = '';
    if (!isNullOrUndefined(categories)) {
        let categoryNamesArray = categories.map(cat => {
            return cat.Name;
        });
        return categoryNamesArray.join();
    }
    return categoryNames;
}

export function getServiceNames(categories: sharedDocument[]): string {
    let serviceName: string = '';
    if (!isNullOrUndefined(categories)) {
        let serviceNames: Array<string> = new Array<string>();
        categories.forEach(category => {
            serviceNames = serviceNames.concat(category.ServiceName.split(','));
        });
        if (!isNullOrUndefined(serviceNames) && (serviceNames.length > 0)) {
            serviceNames = Array.from(new Set(serviceNames));
            serviceName = serviceNames.join();
        }
    }
    return serviceName;
}
