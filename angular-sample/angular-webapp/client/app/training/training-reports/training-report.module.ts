import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { TrainingReportService } from './services/training-report.service';
import { TrainingReportsListComponent } from './components/training-report-list/training-report-list.component';
import { TrainingReportsHeaderComponent } from './components/training-report-header/training-report-header.component';
import { TrainingReportContainerComponent } from './container/training-report.component';
import { routes } from './training-report.routes';
import { IBreadcrumb } from '../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../../atlas-elements/common/services/breadcrumb-service';
import { initLocalizationWithAdditionProviders, LocalizationConfig } from '../../shared/localization-config';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { RouterModule } from '@angular/router';
import { AtlasElementsModule } from '../../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BreadcrumbGroup } from '../../atlas-elements/common/models/ae-breadcrumb-group';

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
        TrainingReportsHeaderComponent
        , TrainingReportsListComponent
        , TrainingReportContainerComponent],
    exports: [TrainingReportContainerComponent],
    providers: [TrainingReportService
    , LocalizationConfig    
    ]

})
export class TrainingReportModule {
    constructor(private _localizationConfig: LocalizationConfig
        , private _localeService: LocaleService
        , private _translationService: TranslationService
        , private _breadcrumbService: BreadcrumbService) {        
        const bcItem: IBreadcrumb = { isGroupRoot: true, group: BreadcrumbGroup.TrainingReport, label: 'Training report', url: '/training/report' };
    this._breadcrumbService.add(bcItem);
    }
}