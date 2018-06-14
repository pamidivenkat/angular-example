import { DocumentConstants } from './../document-constants';
import { AeInformationBarItemType } from '../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { AeInformationBarItem } from './../../atlas-elements/common/models/ae-informationbar-item';
import { Injectable } from '@angular/core';


@Injectable()
export class InformationBarService {
    public GetTheSelectedTabRoute(selectedItem: AeInformationBarItem): string {
        let routeToNavigate: string = DocumentConstants.Routes.Default + "/";
        switch (selectedItem.Type) {
            case AeInformationBarItemType.DocumentsAwaiting:
            case AeInformationBarItemType.CompanyDocuments:
                {
                    routeToNavigate += DocumentConstants.Routes.SharedDocuments + "/" + DocumentConstants.Routes.DistributedDocuments;
                    break;
                }
            case AeInformationBarItemType.TrainingCertificates:
            case AeInformationBarItemType.PersonalDocuments:
                {
                    routeToNavigate += DocumentConstants.Routes.PersonalDocuments
                    break;
                }
            case AeInformationBarItemType.RiskAssesmentDocuments: {
                routeToNavigate += DocumentConstants.Routes.CompanyDocuments + "/" + DocumentConstants.Routes.HSDocuments + "/" + DocumentConstants.Routes.HSDocumentSuite+'/category/512/live';
                break;
            }
            case AeInformationBarItemType.HandbooksOutstanding: {
                routeToNavigate += DocumentConstants.Routes.CompanyDocuments + "/" + DocumentConstants.Routes.ContractsAndHandbooks + "/" + DocumentConstants.Routes.HandBooks;
                break;
            }
        }
        return routeToNavigate;

    }
}

