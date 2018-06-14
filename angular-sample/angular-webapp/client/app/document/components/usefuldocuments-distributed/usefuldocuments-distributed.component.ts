import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import * as fromRoot from './../../../shared/reducers';
import {  DistributedDocumentsModeOfOperation } from '../../models/document';

@Component({
  selector: 'usefuldocuments-distributed',
  templateUrl: './usefuldocuments-distributed.component.html',
  styleUrls: ['./usefuldocuments-distributed.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class UsefuldocumentsDistributedComponent  extends BaseComponent implements OnInit {

private _sharedDocumentOperationMode:DistributedDocumentsModeOfOperation = DistributedDocumentsModeOfOperation.SharedDocuments;

get sharedDocumentOperationMode(){
  return this._sharedDocumentOperationMode;
}
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
