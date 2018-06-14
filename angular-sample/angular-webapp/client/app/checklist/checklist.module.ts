import { AtlasSharedModule } from './../shared/atlas-shared.module';
import { FileUploadService } from '../shared/services/file-upload.service';
import { ChecklistActionItemsComponent } from './components/action-checklist/action-checklist.component';
import { CheckListRouteResolve } from './services/checklist-resolver.service';
import { UserService } from '../company/user/services/user.service';
import { ChecklistTabAuthGuard } from './security/checklist-tab-guard';
import { ChecklistSecurityService } from './services/cheklist-security.service';
import { PreviewComponent } from './components/preview/preview.component';
import { GeneralComponent } from './components/general/general.component';
import { CheckItemsComponent } from './components/checkitems/checkitems.component';
import { AddCheckListComponent } from './components/add/add.component';
import { ChecklistService } from './services/checklist.service';
import { IBreadcrumb } from '../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../atlas-elements/common/services/breadcrumb-service';
import { initLocalizationWithAdditionProviders, LocalizationConfig } from '../shared/localization-config';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { AtlasElementsModule } from '../atlas-elements/atlas-elements.module';
import { routes } from './checklist.routes';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ChecklistContainerComponent } from './containers/checklist-container/checklist-container.component';
import { CheckitemsAddUpdateComponent } from './components/checkitems-add-update/checkitems-add-update.component';
import { TodaysOrCompleteIncompleteChecklistComponent } from './components/todays-or-complete-incomplete-checklist/todays-or-complete-incomplete-checklist.component';
import { ScheduledChecklistComponent } from './components/scheduled-checklist/scheduled-checklist.component';
import { CompanyExampleArchivedChecklistComponent } from './components/company-example-archived-checklist/company-example-archived-checklist.component';
import { AssignmentComponent } from './components/assignment/assignment.component';
import { ChecklistCopyComponent } from './components/checklist-copy/checklist-copy.component';
import { BreadcrumbGroup } from '../atlas-elements/common/models/ae-breadcrumb-group';
@NgModule({
  imports: [
    CommonModule
    , ReactiveFormsModule
    , AtlasElementsModule
    , AtlasSharedModule
    , RouterModule.forChild(routes)
    , LocalizationModule
  ],
  declarations: [
    ChecklistContainerComponent
    , TodaysOrCompleteIncompleteChecklistComponent
    , AddCheckListComponent
    , CheckItemsComponent
    , GeneralComponent
    , PreviewComponent
    , CheckitemsAddUpdateComponent
    , ScheduledChecklistComponent
    , CompanyExampleArchivedChecklistComponent
    , AssignmentComponent
    , ChecklistCopyComponent
    , ChecklistActionItemsComponent
  ],
  providers: [
    LocalizationConfig
    , ChecklistService
    , ChecklistSecurityService
    , ChecklistTabAuthGuard
    , UserService
    , CheckListRouteResolve
  ]
})
export class ChecklistModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {
    const bcItem: IBreadcrumb = { isGroupRoot: true, group: BreadcrumbGroup.Checklist, label: 'Checklists', url: '/checklist' };
    this._breadcrumbService.add(bcItem);
  }
}
