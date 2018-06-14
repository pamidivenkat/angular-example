import { ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AfterViewInit } from '@angular/core/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Observable } from 'rxjs/Rx';

import { BaseComponent } from '../../../shared/base-component';
import * as fromRoot from '../../../shared/reducers';
import { DocumentConstants } from './../../document-constants';

@Component({
  selector: 'shared-documents-container',
  templateUrl: './shared-documents-container.component.html',
  styleUrls: ['./shared-documents-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SharedDocumentsContainerComponent extends BaseComponent implements OnInit, AfterViewInit {

  // Private Fields
  private _documentsModuleUrl: string = DocumentConstants.Routes.Default;
  private _companyDocumentsUrl: string = DocumentConstants.Routes.CompanyDocuments;
  private _distributedDocumentsUrl: string = DocumentConstants.Routes.DistributedDocuments;
  private _distributedUsefulDocumentsUrl: string = DocumentConstants.Routes.DistributedUsefulDocuments;
  private _totalDocumentsToReviewCount$: Observable<number>;
  private _totalUsefulDocumentsToReviewCount$: Observable<number>;
  private _documentsToReviewHeader: string;
  private _hasAnyTabStripCountChnaged: boolean;
  // End of Private Fields

  // Public properties
  get TotalDocumentsToReviewCount$(): Observable<number> {
    return this._totalDocumentsToReviewCount$;
  }
  set TotalDocumentsToReviewCount$(value: Observable<number>) {
    this._totalDocumentsToReviewCount$ = value;
  }
  get TotalUsefulDocumentsToReviewCount$(): Observable<number> {
    return this._totalUsefulDocumentsToReviewCount$;
  }
  set TotalUsefulDocumentsToReviewCount$(value: Observable<number>) {
    this._totalUsefulDocumentsToReviewCount$ = value;
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
    , private _route: ActivatedRoute
    , private _router: Router) {
    super(_localeService, _translationService, _cdRef);
    this.id = 'shared-container';
    this.name = 'shared-container';
  }
  // End of constructor

  // Private methods

  getDocumentsToReviewUrl(): string {
    return this._distributedDocumentsUrl;
  }

  getUsefulDocumentsUrl(): string {
    return this._distributedUsefulDocumentsUrl;
  }
  private _getDocumentsToReviewHeader() {
    return this._documentsToReviewHeader;
  }

  onCountChange($event: boolean) {
    if ($event)
      this._hasAnyTabStripCountChnaged = $event;
    if (this._hasAnyTabStripCountChnaged)
      this._cdRef.markForCheck();
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this._totalDocumentsToReviewCount$ = this._store.let(fromRoot.getDocumentsToReviewTotalCountData);
    this._totalUsefulDocumentsToReviewCount$ = this._store.let(fromRoot.getUsefulDocumentsToReviewTotalCountData);
  }
  ngAfterViewInit() {
    //after content is loaded, redirecting to default route which is distributed documents route..
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge',
      relativeTo: this._route
    };
    this._router.navigate(["./" + DocumentConstants.Routes.DistributedDocuments], navigationExtras).then((val) => {
    }).catch((err) => {
    });
  }
  // End of public methods


}
