import { EnumHelper } from '../../shared/helpers/enum-helper';
import { getSensitivityName } from '../../employee/common/extract-helpers';
import { RouteParams } from './../../shared/services/route-params';
import { sharedDocument } from './../usefuldocuments-templates/models/sharedDocument';
import { any } from 'codelyzer/util/function';
import { isNullOrUndefined } from 'util';
import { AtlasApiResponse } from './../../shared/models/atlas-api-response';
import { AeInformationBarItemType } from '../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { AeInformationBarItem } from './../../atlas-elements/common/models/ae-informationbar-item';
import { DistributedDocument, DocumentCategory } from './../models/DistributedDocument';
import { Response } from '@angular/http';
import { DistributedDocumentsModeOfOperation, Document } from '../models/document';
import { Employee } from "../../employee/models/employee.model";
import { AeSelectItem } from "./../../atlas-elements/common/models/ae-select-item";
import * as Immutable from 'immutable';
import { AdditionalService } from './../../shared/models/lookup.models';
import { Sensitivity } from './../../shared/models/sensitivity';

export function extractDocuments(response: Response): Array<Document> {
    let documents = Array.from(response.json()) as Document[];
    return documents;
}

export function extractDocument(response: Response): Document {
    let document = response.json() as Document;
    return document;
}

export function processDistributedSharedDocuments(distSharedDocuments: AtlasApiResponse<DistributedDocument>): AtlasApiResponse<DistributedDocument> {
    if (distSharedDocuments) {
        distSharedDocuments.Entities.forEach(distSharedDocument => {
            distSharedDocument.DocumentName = distSharedDocument.Title; //Assign title to the document name
            distSharedDocument.Services = concatenateServiceNames(distSharedDocument.Category);
            distSharedDocument.OperationMode = DistributedDocumentsModeOfOperation.SharedDocuments;
            distSharedDocument.ActionedDateOn = distSharedDocument.ActionTakenOn;
            distSharedDocument.DocumentAction = distSharedDocument.Action;
        });
        return distSharedDocuments;
    }
}

export function processDistributedDocuments(distSharedDocuments: AtlasApiResponse<DistributedDocument>): AtlasApiResponse<DistributedDocument> {
    if (distSharedDocuments) {
        distSharedDocuments.Entities.forEach(distSharedDocument => {
            distSharedDocument.OperationMode = DistributedDocumentsModeOfOperation.Documents;
        });
        return distSharedDocuments;
    }
}
export function concatenateServiceNames(sharedDocumentCategory: DocumentCategory) {
    let servicesList: string = "";
    if (sharedDocumentCategory.Services) {
        sharedDocumentCategory.Services.forEach(service => {
            servicesList += service.Title + ",";
        });
        servicesList = servicesList.substring(0, servicesList.length - 1);
    }
    return servicesList;
}

export function processDocumentInfomationBarItems(items: AeInformationBarItem[], companyId: string): AeInformationBarItem[] {
    if (companyId && items && items.length > 0) {
        //if cid exists then we should filterout some information components( documents to action, shared documents information components , training certificates, personal documents) as they are no longer relevant APB-19326
        items = items.filter(obj => obj.Type != AeInformationBarItemType.DocumentsAwaiting
            && obj.Type != AeInformationBarItemType.CompanyDocuments
            && obj.Type != AeInformationBarItemType.TrainingCertificates
            && obj.Type != AeInformationBarItemType.PersonalDocuments
        );
    };
    if (items) {
        items.forEach(item => {
            switch (item.Type) {
                case item.Type = AeInformationBarItemType.DocumentsAwaiting:
                    item.ToolTip = item.Count == 0 ? "Looks like you're up to date" : "Click here to view documents that need your action";
                    break;
                case item.Type = AeInformationBarItemType.TrainingCertificates:
                    item.ToolTip = item.Count == 0 ? "You have no training certificates" : "Click here to view your Training Certificates";
                    break;
                case item.Type = AeInformationBarItemType.PersonalDocuments:
                    item.ToolTip = item.Count == 0 ? "Looks like you haven't uploaded anything here yet!" : "Click here to view the documents you have uploaded";
                    break;
                case item.Type = AeInformationBarItemType.CompanyDocuments:
                    item.ToolTip = item.Count == 0 ? "Keep an eye on this area for when documents are sent to you" : "Click here to view the documents that have been shared with you";
                    break;
                case item.Type = AeInformationBarItemType.RiskAssesmentDocuments:
                    item.ToolTip = item.Count == 0 ? "Looks like you don't currently have any Risk Assessments. Go to your Risk Assessment Library to create some" : "This number shows your active risk assessments. You may see more risk assessments in this folder if you've exported any that have not yet been approved.";
                    break;
                case item.Type = AeInformationBarItemType.HandbooksOutstanding:
                    item.ToolTip = item.Count == 0 ? "Looks like everyone has actioned the handbook sent to them" : `Click here to view the distributed Employee Handbook that still requires action`;
                    break;
                default:
                    break;
            }

        });
    }
    return items;
}

export function extractPersonalDocuments(documents: Document[]) {
    if (isNullOrUndefined(documents)) return null;
    return documents.filter(document => document.DocumentSubCategory !== 'Profile Picture')
}
export function extractEmployeeListToAeSelect(employees: Employee[]) {
    let aeSelectItems: Array<AeSelectItem<string>> = [];
    if (isNullOrUndefined(employees)) return null;
    else {
        employees.map((employee) => {
            let middleName = (isNullOrUndefined(employee.MiddleName) ? '' : employee.MiddleName);
            let aeSelectItem = new AeSelectItem<string>(employee.FirstName + ' ' + middleName + ' ' + employee.Surname, employee.Id);
            aeSelectItems.push(aeSelectItem);

        });
    }
    return aeSelectItems;
}
export function mapSiteDataToAeSelectItems(dataSource: any[]): Immutable.List<AeSelectItem<string>> {
    if (dataSource) {
        let aeSelectList = Immutable.List(dataSource.map((item) => {
            let ee = new AeSelectItem<string>(item.Name, item.Id, false);
            return ee;
        }));

        return aeSelectList;
    } else {
        return Immutable.List<AeSelectItem<string>>([]);
    }
}

export function mapCategoryDataToAeSelectItems(dataSource: any[]): Immutable.List<AeSelectItem<string>> {
    if (dataSource) {
        return Immutable.List(dataSource.map((item) => {
            let ee = new AeSelectItem<string>(item.Name, item.Code, false);
            return ee;
        }).sort(function (a, b) {
            if (a.Text < b.Text)
                return -1;
            if (a.Text > b.Text)
                return 1;
            return 0;
        }));
        // return aeSelectList;
    } else {
        return Immutable.List<AeSelectItem<string>>([]);
    }
}

export function mapVersionAeSelectItems(dataSource: any[]): Immutable.List<AeSelectItem<string>> {
    if (dataSource && dataSource.length > 0) {
        let version = [];
        dataSource.map((ele) => {
            let checkversion = version.indexOf(ele.DocumentVersionInfo);
            if (checkversion === -1) {
                version.push(ele.DocumentVersionInfo);
            }
        })
        if (version) {
            let aeSelectList = Immutable.List(version.map((item) => {
                let ee = new AeSelectItem<string>(item, item, false);
                return ee;
            }));
            return aeSelectList;
        }
        else {
            return Immutable.List<AeSelectItem<string>>([]);
        }
    }
    else {
        return Immutable.List<AeSelectItem<string>>([]);
    }
}

export function mapAdditionalServiceToAeSelectItems(dataSource: any[]): Immutable.List<AeSelectItem<string>> {
    if (dataSource) {
        let aeSelectList = Immutable.List(dataSource.map((item) => {
            let ee = new AeSelectItem<string>(item.Title, item.Id, false);
            return ee;
        }));
        return aeSelectList;
    }
    else {
        return Immutable.List<AeSelectItem<string>>([]);
    }
}

export function mapSharedCategoryDataToAeSelectItems(dataSource: sharedDocument[], services: AdditionalService[]): Array<AeSelectItem<string>> {
    let aeSelectarr = [];
    if (services && dataSource) {
        let items: Array<sharedDocument> = [];
        services.map((service) => {
            items = items.concat(dataSource.filter(sc => {
                return (sc.Services.filter(m => m.Code === service.Code)
                    && sc.Services.filter(m => m.Code === service.Code).length > 0
                    && items.filter(d => d.Id === sc.Id).length === 0) ? true : false;
            }));
        });
        aeSelectarr = extractSharedDocumentCategorySelectItems(items);
        return aeSelectarr;
    }
    return aeSelectarr;
}



export function extractSharedDocumentCategorySelectItems(sharedCategories: sharedDocument[]): AeSelectItem<string>[] {
    if (sharedCategories) {
        return sharedCategories.map((keyValuePair) => {
            let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id, false);
            aeSelectItem.Childrens = null;
            return aeSelectItem;
        });
    } else {
        return [];
    }
}

export function getDocumentSensitivityList(sensitivity: typeof Sensitivity) {
    return Immutable.List(EnumHelper.getNamesAndValues(sensitivity).map((enumItem) => {
        let item: AeSelectItem<number> = new AeSelectItem<number>();
        item.Text = getSensitivityName(enumItem.value);
        item.Value = enumItem.value;
        return item;
    })).sort((a, b) => { return a.Text.localeCompare(b.Text) }).toList();
}
