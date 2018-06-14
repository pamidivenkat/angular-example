import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { FormBuilderService } from '../../shared/services/form-builder.service';
import { AtlasElementsModule } from '../../atlas-elements/atlas-elements.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskAddComponent } from './task-add/task-add.component';
import { TaskUpdateComponent } from './task-update/task-update.component';
import { TaskDetailsComponent } from './task-details/task-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TaskCategoryService } from '../services/task-category.service';
import { TaskService } from '../services/task-service';
import { initLocalizationWithAdditionProviders, LocalizationConfig } from '../../shared/localization-config';
@NgModule({
  imports: [
    CommonModule
    , ReactiveFormsModule
    , AtlasElementsModule
    , LocalizationModule
    , AtlasSharedModule
  ],
  declarations: [
    TaskAddComponent
    , TaskUpdateComponent
    , TaskDetailsComponent
  ],
  exports: [
    TaskAddComponent
    , TaskUpdateComponent
    , TaskDetailsComponent
  ],
  providers: [
    LocalizationConfig
    , TaskCategoryService
    , TaskService
  ]
})
export class TaskFormsModule {
  constructor(private _localizationConfig: LocalizationConfig, private _localeService: LocaleService, private _translationService: TranslationService
  ) {    
  }

}
