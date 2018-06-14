import { RouteParams } from './../../../shared/services/route-params';
import { AeListItem } from './../../../atlas-elements/common/models/ae-list-item';
import { AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import { subscribeOn } from 'rxjs/operator/subscribeOn';
import { KeyDocuments } from './../../models/key-documents';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from './../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, Input, ChangeDetectionStrategy, OnChanges } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { KeyDocumentsLoadAction } from "./../../actions/key-documents-actions";

@Component({
  selector: 'app-keydocuments',
  templateUrl: './key-documents.component.html',
  styleUrls: ['./key-documents.component.scss']
})
export class KeydocumentsComponent extends BaseComponent implements OnInit, OnChanges {

  // Private Fields

  // End of Public properties

  private _keyDocuments: KeyDocuments[];
  private _aeDocumentItems: AeListItem[];
  private _isLoading: boolean = false;
  // End of Private Fields

  // Public properties
  @Input('keyDocuments')
  get keyDocuments(): KeyDocuments[] {
    return this._keyDocuments;
  }
  set keyDocuments(value: KeyDocuments[]) {
    this._keyDocuments = value;
  }
  @Input('isLoading')
  get isLoading(): boolean {
    return this._isLoading;
  }
  set isLoading(value: boolean) {
    this._isLoading = value;
  }

  get aeDocumentItems(): AeListItem[] {
    return this._aeDocumentItems;
  }
  set aeDocumentItems(value: AeListItem[]) {
    this._aeDocumentItems = value;
  }

  get immutableItems() {
    return Immutable.List(this._aeDocumentItems);
  }
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);

  }
  // End of constructor

  // Private methods
  needToShowNokeyDocsMsg(): boolean {
    return this._aeDocumentItems && this._aeDocumentItems.length == 0;
  }
  // End of private methods

  // Public methods
  onKeyDocumentClick(ev: any) {
    let selectedItem: KeyDocuments = ev.selectedItem;
    let url = this._routeParamsService.Cid ? '/filedownload?documentId=' + selectedItem.Id + '&version=' + selectedItem.DocumentVersion + "&cid=" + this._routeParamsService.Cid : '/filedownload?documentId=' + selectedItem.Id + '&version=' + selectedItem.DocumentVersion;
    window.open(url);
  }

  ngOnInit(): void {
  }
  ngOnChanges(): void {
    if (this.keyDocuments) {
      this.aeDocumentItems = [];
      this.keyDocuments.forEach(document => {
        let listItem = new AeListItem(document);
        listItem.Text = document.Category == 128 ? 'Your Contract' : document.CategoryName;
        listItem.IsClickable = true;
        this.aeDocumentItems.push(listItem);
      });
    }
  }
  // End of public methods

}
