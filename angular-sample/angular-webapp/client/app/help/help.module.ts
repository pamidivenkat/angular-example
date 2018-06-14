import { AtlasSharedModule } from './../shared/atlas-shared.module';
import { HelpSearchContentComponent } from './components/help-search-content/help-search-content.component';
import { HelpContentComponent } from './components/help-content/help-content.component';
import { HelpAreaComponent } from './components/help-area/help-area.component';
import { LocalizationModule, LocaleService, TranslationService } from 'angular-l10n';
import { RouterModule } from '@angular/router';
import { AtlasElementsModule } from '../atlas-elements/atlas-elements.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpContainerComponent } from './containers/help-container/help-container.component';
import { routes } from './help.routes';
import { WhatsNewLatestReleasesComponent } from './components/whats-new-latest-releases/whats-new-latest-releases.component';
import { WhatsNewArticleDetailsComponent } from './components/whats-new-article-details/whats-new-article-details.component';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from "../shared/localization-config";
import { BreadcrumbService } from "../atlas-elements/common/services/breadcrumb-service";
import { BreadcrumbGroup } from '../atlas-elements/common/models/ae-breadcrumb-group';
import { IBreadcrumb } from './../atlas-elements/common/models/ae-ibreadcrumb.model';
import { ManageHelpContentComponent } from './components/manage-help-content/manage-help-content.component';
import { AddUpdateHelpContentComponent } from './components/add-update-help-content/add-update-help-content.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    AtlasElementsModule,
    RouterModule.forChild(routes),
    LocalizationModule,
    AtlasSharedModule,
    ReactiveFormsModule
  ],
  declarations: [HelpContainerComponent,
    WhatsNewLatestReleasesComponent,
    WhatsNewArticleDetailsComponent,
    HelpAreaComponent, HelpContentComponent,
    HelpSearchContentComponent,
    ManageHelpContentComponent,
    AddUpdateHelpContentComponent
  ],
  providers: [
    LocalizationConfig
  ]
})
export class HelpModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {
  }
}
