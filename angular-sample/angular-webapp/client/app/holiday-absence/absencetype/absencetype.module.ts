import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { AbsencetypeService } from './services/absencetype.service';
import { AbsencetypeAddUpdateComponent } from './components/absencetype-add-update/absencetype-add-update.component';
import { AbsenceTypeListComponent } from './components/absencetype-list/absencetype-list.component';
import { AbsencetypeContainerComponent } from './containers/absencetype-container/absencetype-container.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../shared/localization-config';
import { BreadcrumbService } from './../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from './../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AbsenceTypeRoutes } from './absencetype.routes';
import { BreadcrumbGroup } from '../../atlas-elements/common/models/ae-breadcrumb-group';
@NgModule({
  imports: [
    CommonModule
    , AtlasElementsModule
    , RouterModule.forChild(AbsenceTypeRoutes)
    , LocalizationModule
    , AtlasSharedModule
    , ReactiveFormsModule

  ],
  declarations: [
    AbsencetypeContainerComponent
    , AbsenceTypeListComponent
    , AbsencetypeAddUpdateComponent
  ],
  exports: [
  ],
  providers: [
    LocalizationConfig
    , AbsencetypeService
  ]

})
export class AbsenceTypeModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {    
    let bcItem: IBreadcrumb = { isGroupRoot: true, group: BreadcrumbGroup.AbsenceTypes, label: 'Manage absence types', url: '/absence-management/absence-type' };
    this._breadcrumbService.add(bcItem);
  }
}