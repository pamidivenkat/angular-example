import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from "./../../../shared/base-component";
import { LocaleService, TranslationService } from "angular-l10n";
import { ClaimsHelperService } from "./../../../shared/helpers/claims-helper";
import * as fromRoot from '../../../shared/reducers/index';
import { Store } from '@ngrx/store';
import { RouteParams } from "../../../shared/services/route-params";
import { isNullOrUndefined } from "util";
import { Observable } from "rxjs/Observable";
import { Company } from "../../../company/models/company";
@Component({
  selector: 'company-switch-header',
  templateUrl: './company-switch-header.component.html',
  styleUrls: ['./company-switch-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanySwitchHeaderComponent extends BaseComponent implements OnInit {
  //Private variables
  private _currentCompany$: Observable<Company>;
  //End of private variables
  //Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
    , private _routeParams: RouteParams) {
    super(_localeService, _translationService, _cdRef);
  }
  //End of constructor
  //Public properties
  get currentCompany$(): Observable<Company> {
    return this._currentCompany$;
  }
  //End of public properties
  //Public functions

  //End of public functions
  ngOnInit(): void {
    this._currentCompany$ = this._store.let(fromRoot.getCurrentCompanyDetails);
  }

}
