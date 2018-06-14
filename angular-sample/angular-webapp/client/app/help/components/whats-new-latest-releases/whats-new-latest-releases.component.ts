import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';
import { IBreadcrumb } from '../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import { WhatsNewCategory } from '../../../home/models/whats-new';
import { BaseComponent } from '../../../shared/base-component';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import * as fromRoot from '../../../shared/reducers';
import { LoadLatestReleasesAction } from '../../actions/help.actions';
import { Article } from '../../models/article';

@Component({
  selector: 'whats-new-latest-releases',
  templateUrl: './whats-new-latest-releases.component.html',
  styleUrls: ['./whats-new-latest-releases.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class WhatsNewLatestReleasesComponent extends BaseComponent implements OnInit {

  private _latestReleases: Immutable.List<Article>;
  private _defaultNoOfRows: number = 10;
  private _rowsPerPageOptions: number = 10;
  private _currentPageNumber: number;
  private _totalRecords: Observable<number>;
  private _latestReleasesApiRequest: AtlasApiRequestWithParams;
  private _openedArticles: Array<Article>;

  constructor(_localeService: LocaleService
    , _translationService: TranslationService
    , _cdRef: ChangeDetectorRef
    , private _router: Router
    , private _breadcrumbService: BreadcrumbService
    , private _store: Store<fromRoot.State>) {
    super(_localeService, _translationService, _cdRef);
    this._openedArticles = new Array();
    const bcItem: IBreadcrumb = { isGroupRoot: false, group: BreadcrumbGroup.Help, label: 'Latest releases', url: '/help/latest-releases' };
    this._breadcrumbService.add(bcItem);
  }

  get latestReleases(): Immutable.List<Article> {
    return this._latestReleases;
  }
  get defaultNoOfRows(): number {
    return this._defaultNoOfRows;
  }
  get currentPageNumber(): number{
    return this._currentPageNumber;
  }
  get totalRecords(): Observable<number> {
    return this._totalRecords;
  }
  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Help;
  }

  ngOnInit() {
    if (isNullOrUndefined(this._latestReleasesApiRequest))
      this._latestReleasesApiRequest = <AtlasApiRequestWithParams>{};
    let params: AtlasParams[] = new Array();
    params.push(new AtlasParams('fields', 'Id,Title,PublishDate,Category'))
    params.push(new AtlasParams('category', WhatsNewCategory.Release));
    this._currentPageNumber=1;
    this._latestReleasesApiRequest = new AtlasApiRequestWithParams(1, this._defaultNoOfRows, 'PublishDate', SortDirection.Descending, params);
    this._store.dispatch(new LoadLatestReleasesAction(this._latestReleasesApiRequest));
    this._totalRecords = this._store.let(fromRoot.getWhatsNewLatestReleasesCount);
    this._store.let(fromRoot.getWhatsNewLatestReleases).takeUntil(this._destructor$).subscribe((val) => {
      this._latestReleases = val;
      this._cdRef.markForCheck();
    })
  }

  onPageChange(pagingInfo: PagingInfo) {
    if (isNullOrUndefined(this._latestReleasesApiRequest)) {
      this._latestReleasesApiRequest = <AtlasApiRequestWithParams>{};
    }
    this._latestReleasesApiRequest.PageNumber = pagingInfo.PageNumber;
    this._latestReleasesApiRequest.PageSize = pagingInfo.PageSize;
    this._defaultNoOfRows=pagingInfo.PageSize;
    this._currentPageNumber= pagingInfo.PageNumber;
    this._store.dispatch(new LoadLatestReleasesAction(this._latestReleasesApiRequest));
  }
  private _checkArticleVisibility(item: Article) {
    let index = this._openedArticles.findIndex((article) => article.Id === item.Id);
    if (index !== -1) {
      return true;
    } else {
      return false;
    }
  }

  getBodyLoad(item: Article) {
    //this._store.dispatch(new LoadSelectedArticleBodyAction(item.Id));
    let navigateUrl = '/help/article-details';
    navigateUrl += '/' + item.Id;
    this._router.navigateByUrl(navigateUrl);
  }

  isOpen(item: Article): boolean {
    return this._checkArticleVisibility(item);
  }
  ngOnDestroy() {
    super.ngOnDestroy();
  }


}
