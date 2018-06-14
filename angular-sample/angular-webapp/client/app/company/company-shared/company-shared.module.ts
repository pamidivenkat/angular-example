import { AtlasSharedModule } from './../../shared/atlas-shared.module';
//import { EmployeeGroupAssociationComponent } from './components/employee-group-association/employee-group-association.component';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { LocaleService, TranslationService, LocalizationModule } from 'angular-l10n';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../shared/localization-config';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { JobtitleAddComponent } from './jobtitle-add/jobtitle-add.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AtlasElementsModule,
        LocalizationModule,
        AtlasSharedModule
    ],
    declarations: [

        JobtitleAddComponent],
    exports: [
        JobtitleAddComponent
    ],
    providers: [
        LocalizationConfig
    ]
})
export class CompanySharedModule {

    constructor(private _localizationConfig: LocalizationConfig
        , private _localeService: LocaleService
        , private _translationService: TranslationService) {        
    }
}