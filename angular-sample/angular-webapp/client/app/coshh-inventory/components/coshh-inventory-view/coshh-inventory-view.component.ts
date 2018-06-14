import { RouteParams } from './../../../shared/services/route-params';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { BaseComponent } from './../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute } from "@angular/router";
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../shared/reducers';
import * as Immutable from 'immutable';
import { COSHHInventory } from "../../models/coshh-inventory";
import { isNullOrUndefined } from "util";
import { DocumentService } from "./../../../document/services/document-service";
import { Subscription } from "rxjs/Rx";


@Component({
  selector: "coshhinventory-view",
  templateUrl: "./coshh-inventory-view.component.html",
  styleUrls: ["./coshh-inventory-view.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class CoshhInventoryViewComponent extends BaseComponent implements OnInit, OnDestroy {

  private _coshhInventory: COSHHInventory;
  private _selectDocumentSubscription: Subscription;
  private _fileName: string;
  private _attachmentId: string;

  @Output() onCancel = new EventEmitter();

  @Input('selectedCoshhInventory')
  set vm(value: COSHHInventory) {
    this._coshhInventory = value;
  }
  get vm() {
    return this._coshhInventory;
  }
  
  get FileName() {
    return this._fileName;
  }

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _documentService: DocumentService
    , private _routeParamsService: RouteParams
  ) {

    super(_localeService, _translationService, _changeDetectordRef);
  }
  // End of constructor

  // Private methods  
  onFormClosed() {
    this.onCancel.emit("close");
  }
  // End of private methods

  private _loadDocumentDetails(documentId: string) {
    this._documentService.loadSelectedDocument(documentId);
  }

  onSheetDownLoad() {
    let url = this._routeParamsService.Cid ? `/filedownload?documentId=${this._attachmentId}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${this._attachmentId}`;
    window.open(url);
  }

  // Public methods
  ngOnInit() {
    if (!isNullOrUndefined(this._coshhInventory.AttachmentId)) {
      this._attachmentId = this._coshhInventory.AttachmentId;
      this._loadDocumentDetails(this._coshhInventory.AttachmentId);
    }
    this._selectDocumentSubscription = this._store.let(fromRoot.getCurrentDocument).subscribe(res => {
      if (!isNullOrUndefined(res)) {
        this._fileName = res.FileName;
        this._cdRef.markForCheck();
      }
    });
  }
  ngOnDestroy() {
    if (this._selectDocumentSubscription) {
      this._selectDocumentSubscription.unsubscribe();
    }
  }
  // End of public methods
}
