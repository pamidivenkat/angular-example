import { IconAddUpdateComponent } from './components/icon-add-update/icon-add-update.component';
import { AtlasSharedModule } from '../../shared/atlas-shared.module';
import { IconManagementSecurityService } from './services/icon-management-security-service';
import { IconManagementGuard } from './security/icon-management-guard';
import { IconManagementListComponent } from './components/icon-management-list/icon-management-list.component';
import { IconManagementHeaderComponent } from './components/icon-management-header/icon-management-header.component';
import { BreadcrumbGroup } from '../../atlas-elements/common/models/ae-breadcrumb-group';
import { IBreadcrumb } from '../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../../atlas-elements/common/services/breadcrumb-service';
import { LocalizationModule, LocaleService, TranslationService } from 'angular-l10n';
import { LocalizationConfig } from '../../shared/localization-config';
import { RouterModule } from '@angular/router';
import { AtlasElementsModule } from '../../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconManagementContainerComponent } from './container/icon-management-container/icon-management-container.component';
import { routes } from './icon-management.routes';
import { IconManagementViewComponent } from './components/icon-management-view/icon-management-view.component';

@NgModule({
    imports: [
        CommonModule
        , ReactiveFormsModule
        , AtlasElementsModule
        , LocalizationModule
        , AtlasSharedModule
        , RouterModule.forChild(routes)
    ],
    exports: [],
    declarations: [
        IconManagementContainerComponent
        , IconManagementHeaderComponent
        , IconManagementListComponent
        , IconAddUpdateComponent
        , IconManagementViewComponent
    ],
    providers: [
        LocalizationConfig
        , IconManagementGuard
        , IconManagementSecurityService
    ],
})
export class IconManagementModule {
    constructor(private _localizationConfig: LocalizationConfig
        , private _localeService: LocaleService
        , private _translationService: TranslationService
        , private _breadcrumbService: BreadcrumbService) {
        const bcItem: IBreadcrumb = {
            isGroupRoot: true, group: BreadcrumbGroup.IconManagement,
            label: 'Icon management', url: '/icon-management'
        };
        this._breadcrumbService.add(bcItem);
    }
}
