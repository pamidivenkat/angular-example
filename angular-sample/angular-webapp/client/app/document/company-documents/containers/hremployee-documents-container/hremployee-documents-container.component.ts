import { ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Observable } from 'rxjs/Rx';

import { DocumentsFolder } from '../../../models/document';
import { BaseComponent } from './../../../../shared/base-component';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import { DocumentConstants } from './../../../document-constants';
import { DocumentFolderStat } from './../../../models/document';

@Component({
  selector: 'hremployee-documents-container',
  templateUrl: './hremployee-documents-container.component.html',
  styleUrls: ['./hremployee-documents-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HRemployeeDocumentsContainerComponent extends BaseComponent implements OnInit {

  // Private Fields
  private _appraisalReviewsUrl: string = DocumentConstants.Routes.AppraisalReivews;
  private _diciplinaryUrl: string = DocumentConstants.Routes.Disciplinary;
  private _trainingCertificatesUrl: string = DocumentConstants.Routes.TrainingDocuments;
  private _startersUrl: string = DocumentConstants.Routes.StartersAndLeavers;
  private _generalUrl: string = DocumentConstants.Routes.General;

  private _appraisalReviewsStat$: Observable<DocumentFolderStat>;
  private _diciplinaryStat$: Observable<DocumentFolderStat>;
  private _trainingCertificatesStat$: Observable<DocumentFolderStat>;
  private _startersStat$: Observable<DocumentFolderStat>;
  private _generalStat$: Observable<DocumentFolderStat>;

  // End of Private Fields

  // Public properties
  get appraisalReviewsUrl(): string {
    return this._appraisalReviewsUrl;
  }
  get diciplinaryUrl(): string {
    return this._diciplinaryUrl;
  }
  get trainingCertificatesUrl(): string {
    return this._trainingCertificatesUrl;
  }
  get startersUrl(): string {
    return this._startersUrl;
  }
  get generalUrl(): string {
    return this._generalUrl;
  }

  get appraisalReviewsStat$(): Observable<DocumentFolderStat> {
    return this._appraisalReviewsStat$;
  }
  get diciplinaryStat$(): Observable<DocumentFolderStat> {
    return this._diciplinaryStat$;
  }
  get trainingCertificatesStat$(): Observable<DocumentFolderStat> {
    return this._trainingCertificatesStat$;
  }
  get startersStat$(): Observable<DocumentFolderStat> {
    return this._startersStat$;
  }

  get generalStat$(): Observable<DocumentFolderStat> {
    return this._generalStat$;
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
    , private _claimsHelper: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  // Private methods

  // End of private methods

  // Public methods
  public canViewELOrHSDocuments() {
    return this.canViewELDocuments() || this.canViewHSDocuments();
  }
  public canViewELDocuments() {
    return this._claimsHelper.canViewELDocuments();
  }
  public canViewHSDocuments() {
    return this._claimsHelper.canViewHSDocuments();
  }
  ngOnInit() {
    this._appraisalReviewsStat$ = this._store.let(fromRoot.getCompanyDocumentStatsByFolder(DocumentsFolder.AppraisalReviews));
    this._diciplinaryStat$ = this._store.let(fromRoot.getCompanyDocumentStatsByFolder(DocumentsFolder.DisciplinaryAndGrivences));
    this._trainingCertificatesStat$ = this._store.let(fromRoot.getCompanyDocumentStatsByFolder(DocumentsFolder.Trainings));
    this._startersStat$ = this._store.let(fromRoot.getCompanyDocumentStatsByFolder(DocumentsFolder.StartersAndLeavers));
    this._generalStat$ = this._store.let(fromRoot.getCompanyDocumentStatsByFolder(DocumentsFolder.General))
  }
  // End of public methods
}
