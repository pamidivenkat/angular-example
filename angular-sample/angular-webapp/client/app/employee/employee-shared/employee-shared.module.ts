import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { EmployeeGroupAssociationComponent } from './components/employee-group-association/employee-group-association.component';
import { AdminOptionsComponent } from './components/admin-options/admin-options.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { LocaleService, TranslationService, LocalizationModule } from 'angular-l10n';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../shared/localization-config';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AtlasElementsModule,
        LocalizationModule,
        AtlasSharedModule
    ],
    declarations: [
        AdminOptionsComponent,
        EmployeeGroupAssociationComponent,
        ResetPasswordComponent
    ],
    exports: [
        AdminOptionsComponent,
        EmployeeGroupAssociationComponent,
        ResetPasswordComponent
    ],
    providers: [
        LocalizationConfig
    ]
})
export class EmployeeSharedModule {

    constructor(private _localizationConfig: LocalizationConfig
        , private _localeService: LocaleService
        , private _translationService: TranslationService) {

    }
}