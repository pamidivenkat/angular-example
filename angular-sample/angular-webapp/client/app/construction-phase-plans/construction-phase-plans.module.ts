import { AtlasSharedModule } from './../shared/atlas-shared.module';
import { CPPRouteResolve } from './construction-phase-plan-route-resolver';
import {
  ConstructionPhasePlansHeaderComponent
} from './components/construction-phase-plans-header/construction-phase-plans-header.component';
import { ConstructionPhasePlanService } from './services/construction-phase-plans.service';
import {
  ConstructionPhasePlanListComponent
} from './components/construction-phase-plans/construction-phase-plans-list';
import { ConstructionPhasePlansComponent } from './container/construction-phase-plans/construction-phase-plans';
import { AtlasElementsModule } from '../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { routes } from './construction-phase-plans.routes';
import { RouterModule } from '@angular/router';
import { IBreadcrumb } from '../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../atlas-elements/common/services/breadcrumb-service';
import { initLocalizationWithAdditionProviders, LocalizationConfig } from '../shared/localization-config';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CppCopyComponent } from './components/cpp-copy/cpp-copy.component';
import { BreadcrumbGroup } from '../atlas-elements/common/models/ae-breadcrumb-group';

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
    ConstructionPhasePlansComponent
    , ConstructionPhasePlanListComponent,
    ConstructionPhasePlansHeaderComponent,
    CppCopyComponent
  ],
  providers: [ConstructionPhasePlanService
    , LocalizationConfig
    , CPPRouteResolve
  ]
})
export class ConstructionPhasePlanModule {

  constructor(private _localizationConfig: LocalizationConfig,
    private _localeService: LocaleService,
    private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {      
    const breadCrumbItem: IBreadcrumb = {isGroupRoot: true, group: BreadcrumbGroup.CPP, label: 'Construction phase plans', url: '/construction-phase-plan' };
    this._breadcrumbService.add(breadCrumbItem);
  }
}
