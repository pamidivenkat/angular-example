import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { IBreadcrumb } from './../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';

@Component({
    selector: 'training-container',
    templateUrl: './training-list-container.component.html'
})
export class TrainingContainerComponent extends BaseComponent implements OnInit, OnDestroy {

    constructor(_localeService: LocaleService,
        _translationService: TranslationService,
        _cdRef: ChangeDetectorRef,
        private _claimsHelper: ClaimsHelperService,
        private _breadcrumbService: BreadcrumbService
    ) {
        super(_localeService, _translationService, _cdRef);
    }
    ngOnInit(): void {
        const breadCrumbItem: IBreadcrumb = { isGroupRoot: false, group: BreadcrumbGroup.MyTraining, label: 'Training', url: '/training' };
        this._breadcrumbService.add(breadCrumbItem);
    }

    get bcGroup(): BreadcrumbGroup {
        return BreadcrumbGroup.MyTraining;
    }

    ngOnDestroy(): void {

    }
}