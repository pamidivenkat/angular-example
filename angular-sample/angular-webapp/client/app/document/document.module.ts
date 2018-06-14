import { AtlasSharedModule } from './../shared/atlas-shared.module';
import { DraftDocumentRouteResolve } from './services/draft-document-route-resolver';
import { EmployeeSearchService } from './../employee/services/employee-search.service';
import { AddDocumentToDistribute } from './components/add-document-to-distribute/add-document-to-distribute.component';
import { OtcEntityDataService } from './services/otc-data.service';
import { FileUploadModule } from 'ng2-file-upload';
import { DocumentCategoryService } from './services/document-category-service';
import { FormBuilderService } from '../shared/services/form-builder.service';
import { InformationBarService } from './services/information-bar-service';
import { PersonalDocumentsComponent } from './components/personal-documents/personal-documents.component';
import { CompanyDocumentsDistributedComponent } from './components/company-documents-distributed/company-documents-distributed.component';
import { DocumentService } from './services/document-service';
import { DocumentDetailsComponent } from './components/document-details/document-details.component';
import { BreadcrumbService } from '../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from '../atlas-elements/common/models/ae-ibreadcrumb.model';
import { DocumentListContainerComponent } from './containers/document-list-container/document-list-container.component';
import { ReactiveFormsModule } from '@angular/forms';
import { routes } from './document.routes';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AtlasElementsModule } from '../atlas-elements/atlas-elements.module';
import { CommonModule } from '@angular/common';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { initLocalizationWithAdditionProviders, LocalizationConfig } from '../shared/localization-config';
import { DocumentInformationbarComponent } from './components/document-informationbar/document-informationbar.component';
import { UsefuldocumentsDistributedComponent } from './components/usefuldocuments-distributed/usefuldocuments-distributed.component';
import { SharedDocumentsContainerComponent } from './containers/shared-documents-container/shared-documents-container.component';
import { AddPersonalDocumentComponent } from './components/add-personal-document/add-personal-document.component';
import { DocumentActionConfirmComponent } from './components/document-action-confirm/document-action-confirm.component';
import { BreadcrumbGroup } from '../atlas-elements/common/models/ae-breadcrumb-group';
import { CkEditorModule } from '../atlas-elements/ck-editor/ck-editor.module';
import { DocumentSharedModule } from '../document/document-shared/document-shared.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AtlasElementsModule,
        RouterModule.forChild(routes),
        LocalizationModule,
        FileUploadModule,
        AtlasSharedModule,
        CkEditorModule,
        DocumentSharedModule
    ],
    declarations:
        [
            DocumentListContainerComponent
            , SharedDocumentsContainerComponent
            , DocumentInformationbarComponent
            , CompanyDocumentsDistributedComponent
            , PersonalDocumentsComponent
            , UsefuldocumentsDistributedComponent
            , DocumentDetailsComponent
            , DocumentActionConfirmComponent
            , AddPersonalDocumentComponent
            , AddDocumentToDistribute

        ],
    exports: [DocumentListContainerComponent],
    providers: [
        LocalizationConfig
        , InformationBarService
        , DocumentService
        , OtcEntityDataService
        , DraftDocumentRouteResolve
    ]
})
export class DocumentModule {

    constructor(private _localizationConfig: LocalizationConfig, private _localeService: LocaleService, private _translationService: TranslationService
        , private _breadcrumbService: BreadcrumbService) {
        const bcItem: IBreadcrumb = { isGroupRoot: true, group: BreadcrumbGroup.Documents, label: 'Documents', url: '/document' };
        this._breadcrumbService.add(bcItem);
    }

}

