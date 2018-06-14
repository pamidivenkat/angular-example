import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import * as Immutable from 'immutable';
import * as fromRoot from '../../../../shared/reducers';
import { Store } from "@ngrx/store";
import { Router } from '@angular/router';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
@Component({
    selector: 'training-reports-header',
    templateUrl: './training-report-header.component.html',
    styleUrls: ['./training-report-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class TrainingReportsHeaderComponent extends BaseComponent {
    get bcGroup(): BreadcrumbGroup {
        return BreadcrumbGroup.TrainingReport;
    }
    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _store: Store<fromRoot.State>
    ) {
        super(_localeService, _translationService, _cdRef);
    }

}