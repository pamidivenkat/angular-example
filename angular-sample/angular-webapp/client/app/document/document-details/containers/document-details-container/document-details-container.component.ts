import { DocumentConstants } from './../../../document-constants';
import { DistributeDocumentAction } from './../../actions/document-distribute.actions';
import { DistributedDocument } from './../../models/document-details-model';
import { BreadcrumbService } from "../../../../atlas-elements/common/services/breadcrumb-service";
import { IBreadcrumb } from "../../../../atlas-elements/common/models/ae-ibreadcrumb.model";
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from "../../../../shared/base-component";
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from "@ngrx/store";
import * as fromRoot from '../../../../shared/reducers';
import { DocumentDetails, DocumentDetailsType } from '../../../../document/document-details/models/document-details-model';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { DocumentDetailsService } from '../../../../document/document-details/services/document-details.service';
import { Router, ActivatedRoute } from "@angular/router";
import { Observable, Subscription } from "rxjs/Rx";
import { AeSortModel } from '../../../../atlas-elements/common/models/ae-sort-model';
import { isNullOrUndefined } from "util";
import { AddCQCProDetailsAction } from "../../actions/document-export-to-cqc.actions";


@Component({
  selector: 'document-details-container',
  templateUrl: './document-details-container.component.html',
  styleUrls: ['./document-details-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DocumentDetailsContainerComponent extends BaseComponent implements OnInit, OnDestroy {

  // private fields
  private _documentType: DocumentDetailsType;
  private _documentDetails$: Observable<DocumentDetails>;
  private _documentDetailsSubscription: Subscription;
  private _showRemoveDocumentDistributeSelectSlideOut: boolean;
  private _routeParamSubscription: Subscription;
  private _documentId: string;
  private _showDocumentExportToCQCProSlideOut: boolean;
  private _changeHistoryListLoaded$: Observable<boolean>;
  private _changeHistoryListLoadedSubscription: Subscription;
  private _distributionHistoryListLoaded$: Observable<boolean>;
  private _distributionHistoryListLoadedSubscription: Subscription;
  private _employeeActionStatusListLoaded$: Observable<boolean>;
  private _employeeActionStatusListLoadedSubscription: Subscription;
  private _cqcpruchaseDetailsLoadedSubscription: Subscription;
  private _documentDistributedSubscription: Subscription;
  private _isFirstTimeLoad: boolean = false;


  get documentDetails$(): Observable<DocumentDetails> {
    return this._documentDetails$;
  }

  get documentType(): DocumentDetailsType {
    return this._documentType;
  }

  get documentId(): string {
    return this._documentId;
  }

  get showRemoveDocumentDistributeSelectSlideOut(): boolean {
    return this._showRemoveDocumentDistributeSelectSlideOut;
  }

  get showDocumentExportToCQCProSlideOut(): boolean {
    return this._showDocumentExportToCQCProSlideOut;
  }

  // get {
  //   return this.
  // }

  // get {
  //   return this.
  // }

  // get {
  //   return this.
  // }

  // get {
  //   return this.
  // }

  // get {
  //   return this.
  // }

  constructor(private _breadcrumbService: BreadcrumbService
    , protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _documentDetailsService: DocumentDetailsService
    , private _router: Router
    , private _activatedRoute: ActivatedRoute
    , private _store: Store<fromRoot.State>
  ) {
    super(_localeService, _translationService, _cdRef);
    // const bcItem: IBreadcrumb = { label: 'Document details', url: '/document-details' };
    // this._breadcrumbService.add(bcItem);
    if (this._router.url.includes(DocumentConstants.Routes.SharedDocumentDetails)) {
      this._documentType = DocumentDetailsType.SharedDocument;
    } else {
      this._documentType = DocumentDetailsType.Document;
    }
  }

  //public function
  getDocDistributeSlideoutState() {
    return this._showRemoveDocumentDistributeSelectSlideOut ? 'expanded' : 'collapsed';
  }

  onShowDistribute($event) {
    this._showRemoveDocumentDistributeSelectSlideOut = true;
  }

  onDocumentDistribute(distributedDoc: DistributedDocument) {
    //here we need to despatch the action based on the model we recied with document or shared document
    this._store.dispatch(new DistributeDocumentAction(distributedDoc));
    this._showRemoveDocumentDistributeSelectSlideOut = false;
  }

  onAeCancel($event) {
    this._showRemoveDocumentDistributeSelectSlideOut = false;
  }

  getDocumentExportToCQCSlideoutState() {
    return this._showDocumentExportToCQCProSlideOut ? 'expanded' : 'collapsed';
  }

  onCQCCancel($event) {
    this._showDocumentExportToCQCProSlideOut = false;
  }

  onShowExportToCQC($event) {
    this._showDocumentExportToCQCProSlideOut = true;
  }

  onCQCSubmit(cqcData: any) {
    this._store.dispatch(new AddCQCProDetailsAction(cqcData));
    this._showDocumentExportToCQCProSlideOut = false;
  }

  ngOnInit() {
    this._routeParamSubscription = this._activatedRoute.params.subscribe(params => {
      if (params['id']) {
        this._documentId = params['id'];
        this._documentDetailsService.dispatchDocumentDetails(this._documentId, this._documentType);
        this._documentDetails$ = this._store.let(fromRoot.getDocumentDetailsById);;
      }
    });

    this._cqcpruchaseDetailsLoadedSubscription = this._documentDetailsService.getCQCPurchaseDetailsLoadingStatus().subscribe(status => {
      if (!status) {
        this._documentDetailsService.getCQCPurchaseStatusByCompanyId();
      }
    });


    // Distribution history dispatch

    this._distributionHistoryListLoaded$ = this._documentDetailsService.getDistributionHistoryLoadStatus();

    this._distributionHistoryListLoadedSubscription = this._distributionHistoryListLoaded$.subscribe(vl => {
      let status = vl;
      if (!status) {
        this._documentDetailsService.dispatchDistributionHistory(this._documentId);
      }
    });

    //Employee action status dispatch

    this._employeeActionStatusListLoaded$ = this._documentDetailsService.getEmployeeActionStatusLoadStatus();

    this._employeeActionStatusListLoadedSubscription = this._employeeActionStatusListLoaded$.subscribe(vl => {
      let status = vl;
      if (!status) {
        this._documentDetailsService.dispatchEmployeeActionStatusList(this._documentId);
      }
    });
    this._documentDistributedSubscription = this._store.let(fromRoot.getDocumentDistributedStatusData).subscribe((val) => {
      if (this._isFirstTimeLoad && val) {
        this._documentDetailsService.dispatchDistributionHistory(this._documentId);
        this._documentDetailsService.dispatchEmployeeActionStatusList(this._documentId);
      }
      if (!this._isFirstTimeLoad) this._isFirstTimeLoad = true;
    });
    //
    //
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._changeHistoryListLoadedSubscription)) {
      this._changeHistoryListLoadedSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._distributionHistoryListLoadedSubscription)) {
      this._distributionHistoryListLoadedSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._employeeActionStatusListLoadedSubscription)) {
      this._employeeActionStatusListLoadedSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._routeParamSubscription)) {
      this._routeParamSubscription.unsubscribe();
    }
    if (this._documentDistributedSubscription) {
      this._documentDistributedSubscription.unsubscribe();
    }
  }

  //end of public functions

}
