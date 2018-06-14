import { ClaimsHelperService } from "./../../helpers/claims-helper";
import { RouteParams } from "./../../services/route-params";
import { DocumentsFolder, DocumentFolderStat } from "./../../../document/models/document";
import { DocumentCategory } from "./../../../document/models/document-category";
import { DocumentCategoryEnum } from "./../../../document/models/document-category-enum";
import { Subscription } from "rxjs";

export class DocumentCategoryServiceStub{
    private _loadingDocumentCategories: boolean;
    private _documentCategorySubscription: Subscription;
    private _documentCategories: Array<DocumentCategory>;

    getDocumentSubCategories(categoryId: string) {
    }

    loadDocumentCategories() {
    }
    getDocumentCategoriesByArea(categories: Array<DocumentCategory>, area: number) {
    }

    getSiteSelectionRequiredWhileAddUpdate(category: DocumentCategoryEnum) {
    }

    getEmployeeSelectionRequiredWhileAddUpdate(category: DocumentCategoryEnum) {
    }


    getDocumentCategoriesForUpdate(categories: Array<DocumentCategory>) {
    }
    _getUniqueCategories(categories: Array<DocumentCategory>) {
    }
    getDocumentCategoryFilterBeShownByFolder(docFolder: DocumentsFolder) {
    }
    getSitesFilterBeShownByFolder(docFolder: DocumentsFolder) {
    }
    static getAllAvailableFolders() {
    }
    getDepartmentFilterBeShownByFolder(docFolder: DocumentsFolder) {
    }
    getEmployeeFilterBeShownByFolder(docFolder: DocumentsFolder) {
    }
    getDocumentFolderByRoutePath(routePath: string) {
    }
    getDocumentCategoriesByFolder(categories: DocumentCategory[], docFolder: DocumentsFolder){
    }
    getFolderCategories(docFolder: DocumentsFolder) {
    }
    static getFolderCategories(docFolder: DocumentsFolder) {
    }
    getTop1OrDefault(all: DocumentFolderStat[], docFolder: DocumentsFolder) {
    }
    getParentDocumentFolderStat(all: DocumentFolderStat[], parentFolder: DocumentsFolder) {
    }
    getIsDocumentCanBeUpdated(item: Document, claimsHelper: ClaimsHelperService) {
    }
    getIsDocumentCanbeDeleted(item: Document, claimsHelper: ClaimsHelperService, routeParams: RouteParams) {
return true;
    }
}