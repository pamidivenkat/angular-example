import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Rx';

import { LoadAuthorizedDocumentCategories, LoadDocumentSubCategories } from '../../shared/actions/user.actions';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { Sensitivity } from '../../shared/models/sensitivity';
import {
    CarePolicy,
    Certificates,
    Checklist,
    CompanyPolicy,
    ConstructionPhasePlan,
    Contract,
    Coshh,
    Dbs,
    Disciplinary,
    Email,
    File,
    FireRiskAssessment,
    General,
    Grievance,
    IncidentLog,
    Leaver,
    MethodStatement,
    NewStarter,
    Other,
    Performance,
    PerformanceReview,
    PersonalDocument,
    RiskAssessment,
    ScannedDocument,
} from '../document-shared/document-categories/document-category';
import { documentFields } from '../document-shared/models/document-fields';
import { fieldSettings } from '../document-shared/models/field-settings';
import { DocumentFolderStat } from '../models/document';
import { Document, DocumentsFolder, fieldDetails, ResourceUsage } from '../models/document';
import { DocumentArea } from '../models/document-area';
import { DocumentCategory } from '../models/document-category';
import { DocumentCategoryEnum } from '../models/document-category-enum';
import * as fromRoot from './../../shared/reducers';
import { RouteParams } from './../../shared/services/route-params';
import { DocumentConstants } from './../document-constants';

@Injectable()
export class DocumentCategoryService {
    private _loadingDocumentCategories: boolean;
    private _documentCategorySubscription: Subscription;
    private _documentCategories: Array<DocumentCategory>;
    private _fields: Map<DocumentCategoryEnum, documentFields>
        = new Map<DocumentCategoryEnum, documentFields>();

    constructor(private _store: Store<fromRoot.State>) {
        this._loadingDocumentCategories = false;
        this._fields.set(DocumentCategoryEnum.General, new General());
        this._fields.set(DocumentCategoryEnum.Contract, new Contract())
        this._fields.set(DocumentCategoryEnum.Emails, new Email());
        this._fields.set(DocumentCategoryEnum.CarePolicies, new CarePolicy());
        this._fields.set(DocumentCategoryEnum.CompanyPolicies, new CompanyPolicy());
        this._fields.set(DocumentCategoryEnum.COSHH, new Coshh());
        this._fields.set(DocumentCategoryEnum.CheckList, new Checklist());
        this._fields.set(DocumentCategoryEnum.ConstructionPhasePlans, new ConstructionPhasePlan())
        this._fields.set(DocumentCategoryEnum.Uploads, new File());
        this._fields.set(DocumentCategoryEnum.FireRiskAssessment, new FireRiskAssessment());
        this._fields.set(DocumentCategoryEnum.AccidentLogs, new IncidentLog());
        this._fields.set(DocumentCategoryEnum.MethodStatements, new MethodStatement());
        this._fields.set(DocumentCategoryEnum.Other, new Other());
        this._fields.set(DocumentCategoryEnum.RiskAssessment, new RiskAssessment());
        this._fields.set(DocumentCategoryEnum.Certificates, new Certificates());
        this._fields.set(DocumentCategoryEnum.ScannedDocument, new ScannedDocument());
        this._fields.set(DocumentCategoryEnum.PersonalDocuments, new PersonalDocument());
        this._fields.set(DocumentCategoryEnum.Appraisal, new PerformanceReview());
        this._fields.set(DocumentCategoryEnum.NewStarter, new NewStarter());
        this._fields.set(DocumentCategoryEnum.Leaver, new Leaver());
        this._fields.set(DocumentCategoryEnum.Grievance, new Grievance());
        this._fields.set(DocumentCategoryEnum.Disciplinary, new Disciplinary());
        this._fields.set(DocumentCategoryEnum.DBS, new Dbs());
        this._fields.set(DocumentCategoryEnum.Performance, new Performance());
    }

    getDocumentSubCategories(categoryId: string) {
        this._store.dispatch(new LoadDocumentSubCategories(categoryId));
    }

    loadDocumentCategories() {
        this._store.dispatch(new LoadAuthorizedDocumentCategories(true));
    }
    getDocumentCategoriesByArea(categories: Array<DocumentCategory>, area: number): Array<DocumentCategory> {
        return this._getUniqueCategories(categories.filter(d => d.DocumentArea === area));
    }

    getSiteSelectionRequiredWhileAddUpdate(category: DocumentCategoryEnum): fieldDetails {
        let siteFieldDetails = new fieldDetails();
        switch (category) {
            case DocumentCategoryEnum.AccidentLogs:
            case DocumentCategoryEnum.CarePolicies:
            case DocumentCategoryEnum.CheckList:
            case DocumentCategoryEnum.ConstructionPhasePlans:
            case DocumentCategoryEnum.MethodStatements:
            case DocumentCategoryEnum.RiskAssessment:
            case DocumentCategoryEnum.SiteVisit:
            case DocumentCategoryEnum.COSHH:
            case DocumentCategoryEnum.CompanyPolicies:
                siteFieldDetails.visible = true;
                break;
            case DocumentCategoryEnum.FireRiskAssessment:
                siteFieldDetails.visible = true;
                siteFieldDetails.mandatory = true;
                break
            default:
                siteFieldDetails.visible = false;
                siteFieldDetails.mandatory = false;
        }
        return siteFieldDetails;
    }

    getEmployeeSelectionRequiredWhileAddUpdate(category: DocumentCategoryEnum): fieldDetails {
        let empFieldDetails = new fieldDetails();
        switch (category) {
            case DocumentCategoryEnum.Contract:
            case DocumentCategoryEnum.Appraisal:
            case DocumentCategoryEnum.Grievance:
            case DocumentCategoryEnum.Disciplinary:
            case DocumentCategoryEnum.Leaver:
            case DocumentCategoryEnum.NewStarter:
            case DocumentCategoryEnum.PersonalDocuments:
            case DocumentCategoryEnum.Certificates:
            case DocumentCategoryEnum.Disciplinary:
            case DocumentCategoryEnum.DBS:
            case DocumentCategoryEnum.Performance:
                empFieldDetails.visible = true;
                empFieldDetails.mandatory = true;
                break;
            case DocumentCategoryEnum.General:
            case DocumentCategoryEnum.ScannedDocument:
                empFieldDetails.visible = true;
                empFieldDetails.mandatory = false;
                break;
            default:
                empFieldDetails.visible = false;
                empFieldDetails.mandatory = false;
        }

        return empFieldDetails;
    }

    getSensitivitySelectionRequiredWhileAddUpdate(category: DocumentCategoryEnum): fieldDetails {
        let sensitivityFieldDetails = new fieldDetails();
        switch (category) {
            case DocumentCategoryEnum.Disciplinary:
            case DocumentCategoryEnum.Grievance:
            case DocumentCategoryEnum.PersonalDocuments:
                sensitivityFieldDetails.visible = true;
                sensitivityFieldDetails.mandatory = true;
                sensitivityFieldDetails.defaultValue = Sensitivity.Sensitive;
                break;
            case DocumentCategoryEnum.Leaver:
            case DocumentCategoryEnum.NewStarter:
            case DocumentCategoryEnum.ScannedDocument:
            case DocumentCategoryEnum.General:
            case DocumentCategoryEnum.Certificates:
                sensitivityFieldDetails.visible = true;
                sensitivityFieldDetails.mandatory = true;
                sensitivityFieldDetails.defaultValue = Sensitivity.Basic;
                break;
            case DocumentCategoryEnum.Appraisal:
            case DocumentCategoryEnum.Disciplinary:
            case DocumentCategoryEnum.Performance:
                sensitivityFieldDetails.visible = true;
                sensitivityFieldDetails.mandatory = true;
                sensitivityFieldDetails.defaultValue = Sensitivity.Advance;
                break;
            default:
                sensitivityFieldDetails.visible = false;
                sensitivityFieldDetails.mandatory = false;
        }

        return sensitivityFieldDetails;
    }


    getDocumentCategoriesForUpdate(categories: Array<DocumentCategory>) {
        let updateTargetCategoris =
            [DocumentCategoryEnum.AccidentLogs
                , DocumentCategoryEnum.CarePolicies
                , DocumentCategoryEnum.CheckList
                , DocumentCategoryEnum.ConstructionPhasePlans
                , DocumentCategoryEnum.Contract
                , DocumentCategoryEnum.Disciplinary
                , DocumentCategoryEnum.Emails
                , DocumentCategoryEnum.Uploads
                , DocumentCategoryEnum.FireRiskAssessment
                , DocumentCategoryEnum.Grievance
                , DocumentCategoryEnum.Leaver
                , DocumentCategoryEnum.MethodStatements
                , DocumentCategoryEnum.NewStarter
                , DocumentCategoryEnum.Other
                , DocumentCategoryEnum.Appraisal
                , DocumentCategoryEnum.PersonalDocuments
                , DocumentCategoryEnum.RiskAssessment
                , DocumentCategoryEnum.ScannedDocument
                , DocumentCategoryEnum.General
                , DocumentCategoryEnum.Performance
                , DocumentCategoryEnum.COSHH
                , DocumentCategoryEnum.CompanyPolicies
                , DocumentCategoryEnum.Certificates

            ]

        let folderCategories: DocumentCategory[] = [];
        categories.forEach(docCategory => {
            let filteredFolderCategoryCount = updateTargetCategoris.filter(obj => obj == docCategory.Code).length;
            if (filteredFolderCategoryCount)
                folderCategories.push(docCategory);
        });
        return folderCategories;
    }
    _getUniqueCategories(categories: Array<DocumentCategory>): Array<DocumentCategory> {
        let uniqueCategories = new Array<DocumentCategory>();
        for (let category of categories) {
            if (uniqueCategories.findIndex(c => c.Code === category.Code) === -1)
                uniqueCategories.push(category);
        }
        return uniqueCategories;
    }
    getDocumentCategoryFilterBeShownByFolder(docFolder: DocumentsFolder): boolean {
        let shown: boolean = true; // for only others category is not shown?? , 
        if (docFolder == DocumentsFolder.CompanyPolicies)
            shown = false;
        return shown;
    }
    getSitesFilterBeShownByFolder(docFolder: DocumentsFolder): boolean {
        let shown: boolean = true;
        switch (docFolder) {
            case DocumentsFolder.HanbooksAndPolicies:
                shown = true;
                break;
            case DocumentsFolder.InsepectionReports:
                shown = true;
                break;
            case DocumentsFolder.HSDocumentSuite:
                shown = true;
                break;
            case DocumentsFolder.AppraisalReviews:
                shown = true;
                break;
            case DocumentsFolder.DisciplinaryAndGrivences:
                shown = true;
                break;
            case DocumentsFolder.Trainings:
                shown = true;
                break;
            case DocumentsFolder.StartersAndLeavers:
                shown = true;
                break;
            case DocumentsFolder.Others:
                shown = true;
                break;
            case DocumentsFolder.CompanyPolicies:
                shown = true;
                break;
            case DocumentsFolder.General:
                shown = false;
                break;
            default:
                shown = true;
                break;
        }
        return shown;
    }

    getAllAvailableFolders() {
        return DocumentCategoryService.getAllAvailableFolders();
    }
    static getAllAvailableFolders(): DocumentsFolder[] {
        let allFolders: DocumentsFolder[] = [];
        allFolders.push(DocumentsFolder.HanbooksAndPolicies);
        allFolders.push(DocumentsFolder.InsepectionReports);
        allFolders.push(DocumentsFolder.HSDocumentSuite);
        allFolders.push(DocumentsFolder.AppraisalReviews);
        allFolders.push(DocumentsFolder.DisciplinaryAndGrivences);
        allFolders.push(DocumentsFolder.Trainings);
        allFolders.push(DocumentsFolder.StartersAndLeavers);
        allFolders.push(DocumentsFolder.Others);
        allFolders.push(DocumentsFolder.CompanyPolicies);
        allFolders.push(DocumentsFolder.General);
        return allFolders;
    }
    getDepartmentFilterBeShownByFolder(docFolder: DocumentsFolder): boolean {
        let shown: boolean = false;
        switch (docFolder) {
            case DocumentsFolder.HanbooksAndPolicies:
                shown = false;
                break;
            case DocumentsFolder.InsepectionReports:
                shown = false;
                break;
            case DocumentsFolder.HSDocumentSuite:
                shown = false;
                break;
            case DocumentsFolder.AppraisalReviews:
                shown = true;
                break;
            case DocumentsFolder.DisciplinaryAndGrivences:
                shown = true;
                break;
            case DocumentsFolder.Trainings:
                shown = true;
                break;
            case DocumentsFolder.StartersAndLeavers:
                shown = true;
                break;
            case DocumentsFolder.Others:
                shown = false;
                break;
            case DocumentsFolder.CompanyPolicies:
                shown = false;
                break;
            default:
                shown = true;
                break;
        }
        return shown;
    }
    getEmployeeFilterBeShownByFolder(docFolder: DocumentsFolder): boolean {
        let shown: boolean = false;
        switch (docFolder) {
            case DocumentsFolder.HanbooksAndPolicies:
                shown = false;
                break;
            case DocumentsFolder.InsepectionReports:
                shown = false;
                break;
            case DocumentsFolder.HSDocumentSuite:
                shown = false;
                break;
            case DocumentsFolder.AppraisalReviews:
                shown = true;
                break;
            case DocumentsFolder.DisciplinaryAndGrivences:
                shown = true;
                break;
            case DocumentsFolder.Trainings:
                shown = true;
                break;
            case DocumentsFolder.StartersAndLeavers:
                shown = true;
                break;
            case DocumentsFolder.Others:
                shown = false;
                break;
            case DocumentsFolder.CompanyPolicies:
                shown = false;
                break;
            default:
                shown = true;
                break;
        }
        return shown;
    }
    getDocumentFolderByRoutePath(routePath: string): DocumentsFolder {
        let folder: DocumentsFolder;
        switch (routePath) {
            case DocumentConstants.Routes.HandBooksAndPolicies:
                folder = DocumentsFolder.HanbooksAndPolicies;
                break;
            case DocumentConstants.Routes.InspectionReports:
                folder = DocumentsFolder.InsepectionReports;
                break;
            case DocumentConstants.Routes.HSDocumentSuite:
                folder = DocumentsFolder.HSDocumentSuite;
                break;
            case DocumentConstants.Routes.AppraisalReivews:
                folder = DocumentsFolder.AppraisalReviews;
                break;
            case DocumentConstants.Routes.Disciplinary:
                folder = DocumentsFolder.DisciplinaryAndGrivences;
                break;
            case DocumentConstants.Routes.TrainingDocuments:
                folder = DocumentsFolder.Trainings;
                break;
            case DocumentConstants.Routes.StartersAndLeavers:
                folder = DocumentsFolder.StartersAndLeavers;
                break;
            case DocumentConstants.Routes.Other:
                folder = DocumentsFolder.Others;
                break;
            case DocumentConstants.Routes.CompanyPolicies:
                folder = DocumentsFolder.CompanyPolicies;
                break;
            case DocumentConstants.Routes.General:
                folder = DocumentsFolder.General;
                break;
            default:
                folder = DocumentsFolder.HanbooksAndPolicies;
                break;
        }
        return folder;
    }
    getDocumentCategoriesByFolder(categories: DocumentCategory[], docFolder: DocumentsFolder): DocumentCategory[] {
        let documentLibraryCategories = this.getDocumentCategoriesByArea(categories, DocumentArea.DocumentLibrary);
        let folderCategories: DocumentCategory[] = [];
        let documentFolderCategories = DocumentCategoryService.getFolderCategories(docFolder);
        categories.forEach(docCategory => {
            let filteredFolderCategoryCount = documentFolderCategories.filter(obj => obj == docCategory.Code).length;
            if (filteredFolderCategoryCount)
                folderCategories.push(docCategory);
        });
        return folderCategories;
    }
    getFolderCategories(docFolder: DocumentsFolder): Array<number> {
        return DocumentCategoryService.getFolderCategories(docFolder);
    }
    static getFolderCategories(docFolder: DocumentsFolder): Array<number> {
        let folderCategories: Array<number> = [];
        switch (docFolder) {
            case DocumentsFolder.CitationDrafts:
                folderCategories = [DocumentCategoryEnum.ELHandbook, DocumentCategoryEnum.Handbook, DocumentCategoryEnum.Policy, DocumentCategoryEnum.ContractTemplate];
                break;
            case DocumentsFolder.HanbooksAndPolicies:
                folderCategories = [DocumentCategoryEnum.Handbook, DocumentCategoryEnum.Policy];
                break;
            case DocumentsFolder.InsepectionReports:
                folderCategories = [DocumentCategoryEnum.SiteVisit];
                break;
            case DocumentsFolder.HSDocumentSuite:
                folderCategories = [DocumentCategoryEnum.AccidentLogs
                    , DocumentCategoryEnum.CarePolicies
                    , DocumentCategoryEnum.CheckList
                    , DocumentCategoryEnum.ConstructionPhasePlans
                    , DocumentCategoryEnum.RiskAssessment
                    , DocumentCategoryEnum.FireRiskAssessment
                    , DocumentCategoryEnum.MethodStatements
                    , DocumentCategoryEnum.COSHH];
                break;
            case DocumentsFolder.AppraisalReviews:
                folderCategories = [DocumentCategoryEnum.Appraisal, DocumentCategoryEnum.Performance];
                break;
            case DocumentsFolder.DisciplinaryAndGrivences:
                folderCategories = [DocumentCategoryEnum.Disciplinary, DocumentCategoryEnum.Grievance];
                break;
            case DocumentsFolder.Trainings:
                folderCategories = [DocumentCategoryEnum.Certificates];
                break;
            case DocumentsFolder.StartersAndLeavers:
                folderCategories = [DocumentCategoryEnum.NewStarter, DocumentCategoryEnum.Leaver, DocumentCategoryEnum.Contract];
                break;
            case DocumentsFolder.Others:
                folderCategories = [DocumentCategoryEnum.Other
                    , DocumentCategoryEnum.ComplianceCertificates
                    , DocumentCategoryEnum.Emails
                    , DocumentCategoryEnum.Uploads
                    , DocumentCategoryEnum.ScannedDocument
                    , DocumentCategoryEnum.DBS
                ];
                break;

            case DocumentsFolder.CompanyPolicies:
                folderCategories = [DocumentCategoryEnum.CompanyPolicies];
                break;
            case DocumentsFolder.General:
                folderCategories = [
                    DocumentCategoryEnum.PersonalDocuments
                    , DocumentCategoryEnum.General
                ]

                break;
            default:
                folderCategories = [];
                break;
        }
        return folderCategories;
    }

    getParentDocumentFolderStat(all: DocumentFolderStat[], docFolder: DocumentsFolder): DocumentFolderStat {
        return DocumentCategoryService.getParentDocumentFolderStat(all, docFolder);
    }
    static getTop1OrDefault(all: DocumentFolderStat[], docFolder: DocumentsFolder): DocumentFolderStat {
        let folderStat: DocumentFolderStat = new DocumentFolderStat();
        folderStat.Folder = docFolder;
        if (all) {
            let filteredValues = all.filter(obj => obj.Folder == docFolder);
            if (filteredValues && filteredValues.length > 0)
                folderStat.Count = filteredValues[0].Count;
        }
        return folderStat
    }
    static getParentDocumentFolderStat(all: DocumentFolderStat[], parentFolder: DocumentsFolder): DocumentFolderStat {
        let parentFolderStat: DocumentFolderStat = new DocumentFolderStat();
        parentFolderStat.Folder = parentFolder;
        switch (parentFolder) {
            case DocumentsFolder.HealthAndSafetyDocuments:
                parentFolderStat.Count = DocumentCategoryService.getTop1OrDefault(all, DocumentsFolder.HanbooksAndPolicies).Count
                    + DocumentCategoryService.getTop1OrDefault(all, DocumentsFolder.InsepectionReports).Count
                    + DocumentCategoryService.getTop1OrDefault(all, DocumentsFolder.HSDocumentSuite).Count
                break;
            case DocumentsFolder.HREmployeeDocuments:
                parentFolderStat.Count = DocumentCategoryService.getTop1OrDefault(all, DocumentsFolder.AppraisalReviews).Count
                    + DocumentCategoryService.getTop1OrDefault(all, DocumentsFolder.DisciplinaryAndGrivences).Count
                    + DocumentCategoryService.getTop1OrDefault(all, DocumentsFolder.Trainings).Count
                    + DocumentCategoryService.getTop1OrDefault(all, DocumentsFolder.StartersAndLeavers).Count
                    + DocumentCategoryService.getTop1OrDefault(all, DocumentsFolder.General).Count
                break;
            default:
                parentFolderStat.Count = 0;
                break;

        }
        return parentFolderStat;
    }
    getIsDocumentCanBeUpdated(item: Document, claimsHelper: ClaimsHelperService) {
        if (claimsHelper.canUpdateDocumentCategory() && (item.Category == 0 || item.DocumentOrigin == -1))
            return true;
        return false;
    }
    getIsDocumentCanbeDeleted(item: Document, claimsHelper: ClaimsHelperService, routeParams: RouteParams): boolean {
        let hideDeleteForSensitiveDocs = (item.ModifiedBy != claimsHelper.getUserId() && (item.Sensitivity == Sensitivity.Sensitive)) ? true : false; //fixed document remove button hide issue
        let deletedTobeShownForSesitive = !hideDeleteForSensitiveDocs;
        let isUserUsage = item.Usage == ResourceUsage.User;
        let deletedTobeShownExisting = (
            isUserUsage &&
            item.Category === DocumentCategoryEnum.Uploads &&
            item.ModifiedBy == claimsHelper.getUserId()
        )
            ||
            (
                isUserUsage &&
                item.Category != DocumentCategoryEnum.Uploads
            );

        let delForCitationUsersOnly = true;
        if (!claimsHelper.IsCitationUser) {
            delForCitationUsersOnly = !(item.Category == DocumentCategoryEnum.Policy || item.Category == DocumentCategoryEnum.Handbook || item.Category == DocumentCategoryEnum.ELHandbook || item.Category == DocumentCategoryEnum.ContractTemplate || item.Category == DocumentCategoryEnum.SiteVisit);
        }
        let delCategoryUpload = false;
        if (claimsHelper.isAdministrator || claimsHelper.canViewAllEmployees) {
            delCategoryUpload = isUserUsage && item.Category == DocumentCategoryEnum.Uploads
        }

        //if we have cid and user is not having manage HS Documents or manage EL documents permission then dont show delete button , else continue with same logic.
        if (routeParams.Cid && !(claimsHelper.manageELDocuments() || claimsHelper.manageELDocuments()))
            return false;

        return ((deletedTobeShownExisting && deletedTobeShownForSesitive && delForCitationUsersOnly) || claimsHelper.isAdministrator() || delCategoryUpload);

    }

    public getEmploeeFieldDetails(category: DocumentCategoryEnum): fieldSettings {
        let documentCategoryValue = Number(category);
        return this._fields.get(documentCategoryValue).getEmployeeFieldSettings();
    }

    public getSiteFieldDetails(category: DocumentCategoryEnum): fieldSettings {
        let documentCategoryValue = Number(category);
        return this._fields.get(documentCategoryValue).getSiteFieldSettings();
    }

    public getSensitivityFieldDetails(category: DocumentCategoryEnum): fieldSettings {
        let documentCategoryValue = Number(category);
        return this._fields.get(documentCategoryValue).getSensitivityFieldSettings();
    }

    public getDocumentFolderName(category: DocumentCategoryEnum): string {
        let documentCategoryValue = Number(category);
        return this._fields.get(documentCategoryValue).folderName;
    }

}