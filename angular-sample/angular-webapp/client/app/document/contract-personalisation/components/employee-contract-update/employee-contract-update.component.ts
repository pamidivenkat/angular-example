import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { IBreadcrumb } from './../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { AeLoaderType } from '../../../../atlas-elements/common/ae-loader-type.enum';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { Artifact } from '../../../models/artifact';
import { isNullOrUndefined } from 'util';
import {
  EmployeeContractPersonalisationLoad,
  UpdatePersonalisedDocument
} from '../../actions/contract-personalisation.actions';
import { Observable, Subscription } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import * as fromRoot from '../../../../shared/reducers/index';

@Component({
  selector: 'employee-contract-update',
  templateUrl: './employee-contract-update.component.html',
  styleUrls: ['./employee-contract-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeContractUpdateComponent extends BaseComponent implements OnInit, OnDestroy {
  private _routeParamsSubscription: Subscription;
  private _contractDetailsSubscription: Subscription;
  private _contractId: string;
  private _distributionType: number;
  private _personalisedDocument: Artifact;
  private _contractLoading: boolean;
  private _contractLoadingSubscription: Subscription;
  private _loaderType: AeLoaderType = AeLoaderType.Bars;
  private _hasFileInBlob: boolean;
  private _sourceContractId: string;
  private _sourceContractVersion: string;
  private _sourceContractDetailsSubscription: Subscription;

  get loaderType(): AeLoaderType {
    return this._loaderType;
  }
  get contractLoading(): boolean {
    return this._contractLoading;
  }

  get personalisedDocument(): Artifact {
    return this._personalisedDocument;
  }
  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Contracts;
  }

  get hasFileInBlob(): boolean {
    return this._hasFileInBlob;
  }

  get showPreviousButton(): boolean {
    if (!isNullOrUndefined(this._sourceContractId) || (!isNullOrUndefined(this._personalisedDocument) && !isNullOrUndefined(this._personalisedDocument.SourceDocumentId))) {
      return true;
    }
    return false;
  }

  private _redirectToDistribution() {
    if (this._distributionType == 2) {
      this._router.navigate(['document/company/contracts-and-handbooks/personalised']);
    }
    else {
      this._router.navigate(['document/group-contract-personalisation/bulk-distribute', this._sourceContractId, this._sourceContractVersion]);
    }
  }

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _route: ActivatedRoute
    , private _router: Router
    , private _store: Store<fromRoot.State>
    , private _breadcrumbService: BreadcrumbService) {
    super(_localeService, _translationService, _cdRef);
    this._hasFileInBlob = true;
  }

  ngOnInit() {
    this._sourceContractDetailsSubscription = this._store.let(fromRoot.getContractDetails).subscribe(contr => {
      if (!isNullOrUndefined(contr)) {
        this._sourceContractId = contr.Id;
        this._sourceContractVersion = contr.Version;
      }
    });
    let queryParams = this._route.queryParams;
    let routeParams = this._route.params;
    let routes = Observable.combineLatest(routeParams, queryParams, (routeParam, queryParam) => {
      this._contractId = routeParam['id'];
      this._distributionType = queryParam['distributionType'];
      if (!isNullOrUndefined(this._contractId)) {
        this._store.dispatch(new EmployeeContractPersonalisationLoad({ contractId: this._contractId, withAttributes: true }));
      }
    });
    this._routeParamsSubscription = routes.subscribe();

    if (!isNullOrUndefined(this._sourceContractId)) {
      let bcItem: IBreadcrumb = new IBreadcrumb('Contract personalisation',
        'document/group-contract-personalisation/' + this._sourceContractId, BreadcrumbGroup.Contracts);
      this._breadcrumbService.add(bcItem);
      let bcItem1: IBreadcrumb = new IBreadcrumb('Update',
        '', BreadcrumbGroup.Contracts);
      this._breadcrumbService.add(bcItem1);
    }

    this._contractDetailsSubscription = this._store.let(fromRoot.getPersonalisedContractDetails).subscribe((document) => {
      if (!isNullOrUndefined(document)) {
        this._personalisedDocument = document;
        this._sourceContractId = this._personalisedDocument.SourceDocumentId;
        this._sourceContractVersion = this._personalisedDocument.Version;
        this._cdRef.markForCheck();
      }
    })

    this._store.let(fromRoot.getHasFileIdentifier).takeUntil(this._destructor$).subscribe((data) => {
      this._hasFileInBlob = data;
      this._cdRef.markForCheck();
    });

    this._contractLoadingSubscription = this._store.let(fromRoot.getContractDetailsLoadedState).subscribe((loading) => {
      this._contractLoading = loading;
      this._cdRef.markForCheck();
    });
  }

  ngOnDestroy() {
    this._routeParamsSubscription.unsubscribe();
    this._contractDetailsSubscription.unsubscribe();
    this._sourceContractDetailsSubscription.unsubscribe();
    super.ngOnDestroy();
  }

  disablePreviousButton(): boolean {
    if (this._hasFileInBlob === false) return false;
    if (isNullOrUndefined(this._personalisedDocument)) return true;
    return false;
  }

  onPreviousButtonClick() {
    this._redirectToDistribution();
  }

  savePersonalisedDocumentOnClick() {
    this._store.dispatch(new UpdatePersonalisedDocument(this._personalisedDocument));
    this._redirectToDistribution();
  }

  showDocumentReviewDetails() {
    return !this.contractLoading && this.personalisedDocument;
  }
}
