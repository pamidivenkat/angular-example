import { BreadcrumbService } from './../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';
import { AeInformationBarItemType } from '../../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { AeInformationBarItem } from '../../../atlas-elements/common/models/ae-informationbar-item';
import { Input } from '@angular/core';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Component, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../../../shared/base-component';
import * as fromRoot from '../../../shared/reducers';
import { Company } from '../../models/company';

@Component({
    selector: 'company-header',
    templateUrl: './company-header.component.html',
    styleUrls: ['./company-header.component.scss']
})
export class CompanyHeaderComponent extends BaseComponent {
    // Private Fields
    private _informationBarItems: AeInformationBarItem[];
    private _companyDetails: Company;
    // End of Private Fields

    // Public properties
    @Input('informationBarItems')
    set InformationBarItems(informationBarItems: AeInformationBarItem[]) {
        this._informationBarItems = informationBarItems;
    }

    get InformationBarItems() {
        return this._informationBarItems;
    }

    @Input('companyDetail')
    set companyDetail(val: Company) {
        this._companyDetails = val;
    }

    get companyDetail() {
        return this._companyDetails;
    }

    get informationBarItems() {
        return this._informationBarItems;
    }

    get companyDetails() {
        return this._companyDetails;
    }

    get titleText() {
        return this._companyDetails.CompanyName;
    }

    get bcGroup(): BreadcrumbGroup {
        return BreadcrumbGroup.Company;
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
        , protected _cdRef: ChangeDetectorRef
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _router: Router
        , private _breadcrumbService: BreadcrumbService) {
        super(_localeService, _translationService, _cdRef);
    }
    // End of constructor

    // Private methods
    onInformationBarClick(aeInformationBarItem: AeInformationBarItem) {
        let navExtras: NavigationExtras = {
            queryParamsHandling: "merge"
        };
        switch (aeInformationBarItem.Type) {
            case aeInformationBarItem.Type = AeInformationBarItemType.DocumentsCount:
                this._router.navigate(["document/company"], navExtras);
                break;
            case aeInformationBarItem.Type = AeInformationBarItemType.EmployeesCount:
                this._router.navigate(["employee/manage"], navExtras);
                break;
            case aeInformationBarItem.Type = AeInformationBarItemType.UsersCount:
                this._router.navigate(["company/user"], navExtras);
                break;
            case aeInformationBarItem.Type = AeInformationBarItemType.SitesCount:
                this._router.navigate(["company/site"], navExtras);
                break;
            case aeInformationBarItem.Type = AeInformationBarItemType.RiskAssessmentCount:
                this._router.navigate(["risk-assessment"], navExtras);
                break;
            default:
                break;
        }
    }
    // End of private methods

    // Public methods
    // End of public methods
}