import { LoadContractsTemplateCountAction, LoadPersonalContractsCountAction } from './../../actions/contracts.actions';
import { LoadHandbooksDocsCountAction } from './../../actions/handbooks.actions';
import { Subscription } from 'rxjs/Subscription';
import { DocumentConstants } from './../../../document-constants';
import { InformationBarService } from './../../../services/information-bar-service';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { BaseComponent } from '../../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy } from '@angular/core';
import * as fromRoot from './../../../../shared/reducers';

@Component({
  selector: 'handbook-policies-container',
  templateUrl: './handbook-policies-container.component.html',
  styleUrls: ['./handbook-policies-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class HandbookPoliciesContainerComponent extends BaseComponent implements OnInit, OnDestroy {

  private _handBooksUrl: string = DocumentConstants.Routes.HandBooks;
  private _contractTemplateUrl: string = DocumentConstants.Routes.ContractTemplates;
  private _personalisedContractUrl: string = DocumentConstants.Routes.PersonalisedContracts;
  private _handbookDocsCount: Subscription;
  private _contractDocsCount: Subscription;
  private _personalContractCount: Subscription;
  private _handbookDocsListTotalCount: number;
  private _contractDocsListTotalCount: number;
  private _personalContractTotalCount: number;
  //public properties
  get handbookDocsListTotalCount(): number {
    return this._handbookDocsListTotalCount;
  }
  get contractDocsListTotalCount(): number {
    return this._contractDocsListTotalCount;
  }
  get personalContractTotalCount(): number {
    return this._personalContractTotalCount;
  }
  //end of public properties

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , protected _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _informationBarService: InformationBarService) {
    super(_localeService, _translationService, _cdRef);
    this.id = 'handbook-policies';
    this.name = 'handbook-policies';
  }
  //public methods
  public getHandBookUrl(): string {
    return this._handBooksUrl;
  }
  public getContractTemplateUrl(): string {
    return this._contractTemplateUrl;
  }
  public getPersonalisedContractUrl(): string {
    return this._personalisedContractUrl;
  }

  ngOnInit() {
    this._handbookDocsCount = this._store.let(fromRoot.getHandbooksDocsCount).subscribe((handbookCount) => {
      if (!handbookCount) {
        this._store.dispatch(new LoadHandbooksDocsCountAction(true));
      } else {
        this._handbookDocsListTotalCount = handbookCount;
        this._cdRef.markForCheck();
      }
    })

    this._contractDocsCount = this._store.let(fromRoot.getContractsTemplateCount).subscribe((contractCount) => {
      if (!contractCount) {
        this._store.dispatch(new LoadContractsTemplateCountAction(true));
      } else {
        this._contractDocsListTotalCount = contractCount;
        this._cdRef.markForCheck();
      }
    })

    this._personalContractCount = this._store.let(fromRoot.getPersonalContractsCount).subscribe((personalCount) => {
      if (!personalCount) {
        this._store.dispatch(new LoadPersonalContractsCountAction(true));
      } else {
        this._personalContractTotalCount = personalCount;
        this._cdRef.markForCheck();
      }
    })
  }
  ngOnDestroy() {
    if (this._handbookDocsCount) {
      this._handbookDocsCount.unsubscribe();
    }
    if (this._contractDocsCount) {
      this._contractDocsCount.unsubscribe();
    }
    if (this._personalContractCount) {
      this._personalContractCount.unsubscribe();
    }
  }
  //end of public methods
}