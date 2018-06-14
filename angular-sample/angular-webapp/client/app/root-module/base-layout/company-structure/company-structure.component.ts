import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { isNullOrUndefined } from 'util';

import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../shared/reducers/index';
import { CompanySiteView } from '../../models/company-site-view';
import { CompanyStructure } from '../../models/company-structure';

@Component({
  selector: 'company-structure',
  templateUrl: './company-structure.component.html',
  styleUrls: ['./company-structure.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyStructureComponent extends BaseComponent implements OnInit, OnDestroy {
  //Private variables
  private _companyStructure: Array<CompanyStructure>;
  private _companyStructureData: Array<CompanySiteView>;
  private _isCompanyStructureExpanded: boolean;
  private _loggedInUserCompanyName: string;
  private _loggedInUserCompanyId: string;
  //End of private variables

  //Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>) {
    super(_localeService, _translationService, _cdRef);
    this._isCompanyStructureExpanded = false;
    this._loggedInUserCompanyName = this._claimsHelper.getCompanyName();
    this._loggedInUserCompanyId = this._claimsHelper.getCompanyId();
  }
  //End of constructor

  //Public properties
  get isCompanyStructureExpanded() {
    return this._isCompanyStructureExpanded;
  }

  get loggedInUserCompanyName() {
    return this._loggedInUserCompanyName;
  }
  get companyStructureData() {
    return this._companyStructureData;
  }

  get companyStructure() {
    return this._companyStructure;
  }
  //End of public properties

  //Public methods
  toggleCompanyStructure($event): void {
    this._isCompanyStructureExpanded = !this._isCompanyStructureExpanded;
    $event.stopPropagation();
  }

  isLoggedInUserCompany(companyId: string): boolean {
    return companyId.toLowerCase() === this._loggedInUserCompanyId.toLowerCase();
  }

  //End of public methods

  //Public Output bindings

  //End of output bindings
  ngOnInit() {
    this._store.let(fromRoot.getCompanyStructureData).takeUntil(this._destructor$).subscribe(val => {
      if (!isNullOrUndefined(val)) {
        this._companyStructureData = val;
        this._companyStructure = new Array<CompanyStructure>();
        this._companyStructure.push(new CompanyStructure(this._loggedInUserCompanyId, this._loggedInUserCompanyName, null));
        val.map(item => {
          if (!this.isLoggedInUserCompany(item.Id) && (item.ParentId.toLowerCase() === this._loggedInUserCompanyId.toLowerCase())) {
            let children = val.filter(m => m.ParentId === item.Id);
            this._companyStructure.push(new CompanyStructure(item.Id, item.Name, children));
          }
        });
      }
    });
  }
  
  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
