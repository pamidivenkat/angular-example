import { TaskFormsModule } from './task-forms/task-forms.module';
import { BreadcrumbService } from '../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from '../atlas-elements/common/models/ae-ibreadcrumb.model';
import { TaskCategory } from './models/task-categoy';
import { TaskCategoryService } from './services/task-category.service';
import { TaskService } from './services/task-service';
import { initLocalizationWithAdditionProviders, LocalizationConfig } from '../shared/localization-config';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { RouterModule } from '@angular/router';
import { AtlasElementsModule } from '../atlas-elements/atlas-elements.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskInformationBarComponent } from './task-information-bar/task-information-bar.component';
import { routes } from "./task.routes";
import { AtlasSharedModule } from "../shared/atlas-shared.module";
import { FormBuilderService } from '../shared/services/form-builder.service';
import { BreadcrumbGroup } from '../atlas-elements/common/models/ae-breadcrumb-group';

@NgModule({
  imports: [
    CommonModule
    , AtlasElementsModule
    , ReactiveFormsModule
    , AtlasSharedModule
    , TaskFormsModule
    , RouterModule.forChild(routes)
    , LocalizationModule    
  ],
  declarations: [
    TaskListComponent
    , TaskInformationBarComponent
  ],
  exports: [
    TaskListComponent
  ],
  providers: [TaskCategoryService, TaskService, LocalizationConfig]

})
export class TaskModule {
  constructor(private _localizationConfig: LocalizationConfig, private _localeService: LocaleService, private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) { 
    const bcItem: IBreadcrumb = { isGroupRoot: true, group: BreadcrumbGroup.Tasks, label: 'Tasks', url: '/task' };
    this._breadcrumbService.add(bcItem);
  }
}
