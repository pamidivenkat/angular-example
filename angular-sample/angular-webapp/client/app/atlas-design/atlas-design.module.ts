import { initLocalizationWithAdditionProviders, LocalizationConfig } from '../shared/localization-config';
import { LocaleService, TranslationModule, TranslationService } from 'angular-l10n';
import { ErrorService } from '../shared/error-handling/error.service';
import { AtlasErrorHandler } from '../shared/error-handling/atlas-error-handler';
import { AtlasElementsModule } from '../atlas-elements/atlas-elements.module';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ErrorHandler, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AtlasElementsComponent } from './atlas-elements/atlas-elements.component';
import { routes } from './atlas-design.routes';
import { AeDatatableDemoComponent } from './ae-datatable-demo/ae-datatable-demo.component';
import { AeFormDemoComponent } from './ae-form-demo/ae-form-demo.component';

@NgModule({
  declarations: [
    AtlasElementsComponent,
    AeDatatableDemoComponent,
    AeFormDemoComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpModule,
    FormsModule,
    AtlasElementsModule,
    RouterModule.forChild(routes),
    TranslationModule.forChild()
  ],
  providers: []
})
export class AtlasDesignModule {
  constructor(private _localizationConfig: LocalizationConfig, private _localeService: LocaleService, private _translationService: TranslationService) {
    initLocalizationWithAdditionProviders(_localizationConfig, ['home'])();
  }
}
