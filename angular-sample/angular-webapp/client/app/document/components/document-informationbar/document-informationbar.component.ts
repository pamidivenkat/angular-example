import { RouteParams } from './../../../shared/services/route-params';
import { Output, EventEmitter, OnChanges } from '@angular/core';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, Input } from '@angular/core';
import * as fromRoot from './../../../shared/reducers';
import { AeInformationBarItem } from './../../../atlas-elements/common/models/ae-informationbar-item';
import { processDocumentInfomationBarItems } from '../../common/document-extract-helper';


@Component({
  selector: 'document-informationbar',
  templateUrl: './document-informationbar.component.html',
  styleUrls: ['./document-informationbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DocumentInformationbarComponent extends BaseComponent implements OnInit, OnChanges {

  // Private Fields
  private _documentsInformationBarLoaded: boolean;
  private _documentsInformationItems: AeInformationBarItem[];
  private _documentInformationItemsProcessed: AeInformationBarItem[];
  // End of Private Fields

  // Public properties
  @Input("hasDocumentsInformationBarLoaded")
  get DocumentsInformationBarLoaded(): boolean {
    return this._documentsInformationBarLoaded;
  }
  set DocumentsInformationBarLoaded(value: boolean) {
    this._documentsInformationBarLoaded = value;
  }

  @Input("documentsInformationBarItems")
  get DocumentsInformationItems(): AeInformationBarItem[] {
    return this._documentsInformationItems;
  }
  set DocumentsInformationItems(value: AeInformationBarItem[]) {
    this._documentsInformationItems = value;
  }

  get DocumentInformationItemsProcessed(): AeInformationBarItem[] {
    return this._documentInformationItemsProcessed;
  }
  set DocumentInformationItemsProcessed(value: AeInformationBarItem[]) {
    this._documentInformationItemsProcessed = value;
  }
  // End of Public properties

  // Public Output bindings
  @Output()
  onInformationItemSelected: EventEmitter<any> = new EventEmitter<any>()
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _routeParamsService:RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
  }

  // End of constructor

  // Private methods

  // End of private methods

  // Public methods
  public onDocumentInformationItemSelect($event) {
    this.onInformationItemSelected.emit($event);
  }

  ngOnInit(): void {    
    this._documentInformationItemsProcessed = processDocumentInfomationBarItems(this._documentsInformationItems, this._routeParamsService.Cid);
  }
  ngOnChanges(): void {
    this._documentInformationItemsProcessed = processDocumentInfomationBarItems(this._documentsInformationItems, this._routeParamsService.Cid);
  }
  // End of public methods

}
