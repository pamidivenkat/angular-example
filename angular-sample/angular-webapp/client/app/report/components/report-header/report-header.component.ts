import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';
import { AeInformationBarItem } from '../../../atlas-elements/common/models/ae-informationbar-item';
import { BaseComponent } from '../../../shared/base-component';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
@Component({
    selector: 'report-header',
    templateUrl: './report-header.component.html',
    styleUrls: ['./report-header.component.scss'],
     encapsulation: ViewEncapsulation.None
})
export class ReportHeaderComponent extends BaseComponent implements OnInit, OnDestroy {
    // Private Fields
    private _informationBarItems: AeInformationBarItem[];
    // End of Private Fields

    // Public properties
    @Input('informationBarItems')
    get informationBarItems() {
        return this._informationBarItems;
    }
    set informationBarItems(informationBarItems: AeInformationBarItem[]) {
        this._informationBarItems = informationBarItems;
    }

    get bcGroup(): BreadcrumbGroup {
        return BreadcrumbGroup.Reports;
    }
    // End of Public properties

    // Public Output bindings
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ViewContent bindings
    // End of Public ViewContent bidnings

    // constructor
    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef) {
        super(_localeService, _translationService, _cdRef);
    }
    // End of constructor

    // Private methods
    // End of private methods

    // Public methods
    ngOnInit() {

    }

    ngOnDestroy() {

    }
    // End of public methods
}