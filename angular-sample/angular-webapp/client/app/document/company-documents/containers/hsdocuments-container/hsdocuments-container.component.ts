import { DocumentsFolder } from '../../../models/document';
import { DocumentFolderStat } from './../../../models/document';
import { DocumentConstants } from './../../../document-constants';
import { Observable } from 'rxjs/Rx';
import { ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from './../../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import * as fromRoot from './../../../../shared/reducers';

@Component({
  selector: 'hsdocuments-container',
  templateUrl: './hsdocuments-container.component.html',
  styleUrls: ['./hsdocuments-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HSDocumentsContainerComponent extends BaseComponent implements OnInit {

  // Private Fields
  private _handBooksUrl: string = DocumentConstants.Routes.HandBooksAndPolicies;
  private _inspectionReportsUrl: string = DocumentConstants.Routes.InspectionReports;
  private _hsDocumentSuite: string = DocumentConstants.Routes.HSDocumentSuite;
  private _hankBooksAndPoliciesStat$: Observable<DocumentFolderStat>;
  private _inspectionReportStat$: Observable<DocumentFolderStat>;
  private _hsDocumentSuitStat$: Observable<DocumentFolderStat>;
  // End of Private Fields

  // Public properties
  get handBooksUrl(): string {
    return this._handBooksUrl;
  }
  get inspectionReportsUrl(): string {
    return this._inspectionReportsUrl;
  }
  get hsDocumentSuite(): string {
    return this._hsDocumentSuite;
  }
  get hankBooksAndPoliciesStat$(): Observable<DocumentFolderStat> {
    return this._hankBooksAndPoliciesStat$;
  }
  get inspectionReportStat$(): Observable<DocumentFolderStat> {
    return this._inspectionReportStat$;
  }
  get hsDocumentSuitStat$(): Observable<DocumentFolderStat> {
    return this._hsDocumentSuitStat$;
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
    , protected _store: Store<fromRoot.State>
  ) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  // Private methods

  // End of private methods

  // Public methods
  ngOnInit() {
    this._hankBooksAndPoliciesStat$ = this._store.let(fromRoot.getCompanyDocumentStatsByFolder(DocumentsFolder.HanbooksAndPolicies));
    this._inspectionReportStat$ = this._store.let(fromRoot.getCompanyDocumentStatsByFolder(DocumentsFolder.InsepectionReports));
    this._hsDocumentSuitStat$ = this._store.let(fromRoot.getCompanyDocumentStatsByFolder(DocumentsFolder.HSDocumentSuite));
    
  }
  // End of public methods
}
