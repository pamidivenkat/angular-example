import { LocaleService, TranslationService } from 'angular-l10n';
import { OnDestroy, OnInit, ChangeDetectionStrategy, Component, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../../../shared/base-component';
import { BreadcrumbService } from "../../../atlas-elements/common/services/breadcrumb-service";
import { IBreadcrumb } from "../../../atlas-elements/common/models/ae-ibreadcrumb.model";

@Component({
    selector: 'training-reports',
    templateUrl: './training-report.component.html',
    styleUrls: ['./training-report.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingReportContainerComponent extends BaseComponent implements OnInit, OnDestroy {

    //private fileds

    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _breadcrumbService: BreadcrumbService
    ) {
        super(_localeService, _translationService, _cdRef);
        // const bcItem: IBreadcrumb = { label: 'Training reports', url: '/training/report' };
        // this._breadcrumbService.add(bcItem);
    }
 
    ngOnInit() {
       
    }

}