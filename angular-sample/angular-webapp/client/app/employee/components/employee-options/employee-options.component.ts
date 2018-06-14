import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import * as fromRoot from './../../../shared/reducers';

@Component({
  selector: 'employee-options',
  templateUrl: './employee-options.component.html',
  styleUrls: ['./employee-options.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeOptionsComponent extends BaseComponent implements OnInit  {

 constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);
  }

  ngOnInit() {
  }

}
