import { AtlasSharedModule } from './../shared/atlas-shared.module';
import { ScormService } from '../shared/services/scorm-service';
import { TrainingService } from './services/training-service';
import { AtlasElementsModule } from '../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TrainingListComponent } from './components/training-list/training-list.component';
import { TrainingContainerComponent } from './container/training-list-container/training-list-container.component';
import { routes } from './training.routes';
import { RouterModule } from '@angular/router';
import { IBreadcrumb } from '../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../atlas-elements/common/services/breadcrumb-service';
import { initLocalizationWithAdditionProviders, LocalizationConfig } from '../shared/localization-config';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    RouterModule.forChild(routes),
    LocalizationModule,
    AtlasSharedModule
  ],
  declarations: [
    TrainingContainerComponent
    , TrainingListComponent


  ],
  providers: [TrainingService
    , ScormService
    , LocalizationConfig
  ]
})
export class TrainingModule {

  constructor(private _localizationConfig: LocalizationConfig, private _localeService: LocaleService, private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {
     
  }
}
