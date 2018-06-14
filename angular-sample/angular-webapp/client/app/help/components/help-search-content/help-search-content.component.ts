import { replaceDocumentIdWithFileDownload } from '../../../home/common/extract-helpers';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadHelpAreaSearchContentAction, LoadHelpAreaContentBodyAction, LoadHelpSearchAreaContentBodyAction } from '../../actions/help.actions';
import { HelpContent } from '../../models/helparea';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { BaseComponent } from '../../../shared/base-component';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import * as fromRoot from '../../../shared/reducers';
import { IBreadcrumb } from '../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import { LocaleService, TranslationService } from 'angular-l10n';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import * as Immutable from 'immutable';
import { Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { AeLoaderType } from "../../../atlas-elements/common/ae-loader-type.enum";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'help-search-content',
  templateUrl: './help-search-content.component.html',
  styleUrls: ['./help-search-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class HelpSearchContentComponent extends BaseComponent implements OnInit {

  private _helpSearchContent: Immutable.List<HelpContent>;
  private _defaultNoOfRows: number = 10;
  private _rowsPerPageOptions: number = 10;
  private _totalRecords: Observable<number>;
  private _helpSearchContentApiRequest: AtlasApiRequestWithParams;
  private _routeParamsSub: Subscription;
  private _openedArticles: Array<HelpContent>;
  private _loading: boolean = false;
  private _loaderType: AeLoaderType = AeLoaderType.Bars;
  private _currentRows: number;
  private _currentPageNumber: number = 1;

  constructor(_localeService: LocaleService
    , _translationService: TranslationService
    , _cdRef: ChangeDetectorRef
    , private _breadcrumbService: BreadcrumbService
    , private _route: ActivatedRoute
    , private _router: Router
    , private _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
    , private sanitizer: DomSanitizer
  ) {
    super(_localeService, _translationService, _cdRef);
    this._openedArticles = new Array();
  }

  get currentPageNumber(): number {
    return this._currentPageNumber;
  }

  get currentRows(): number {
    return this._currentRows;
  }
  get firstName(): string {
    return this._claimsHelper.getUserFirstName();
  }
  get HelpSearchContent(): Immutable.List<HelpContent> {
    return this._helpSearchContent;
  }
  get defaultNoOfRows(): number {
    return this._defaultNoOfRows;
  }
  get totalRecords(): Observable<number> {
    return this._totalRecords;
  }
  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Help;
  }

  get loading(): boolean {
    return this._loading;
  }

  get loaderType(): AeLoaderType {
    return this._loaderType;
  }

  get isNoMatchedArticles() {
    return !this._loading && (!isNullOrUndefined(this._helpSearchContent) && this._helpSearchContent.size == 0) ? true : false;
  }

  ngOnInit() {

    this._route.params.takeUntil(this._destructor$).subscribe((param) => {
      let searchKeyBy = param['searchKey'];
      if (isNullOrUndefined(this._helpSearchContentApiRequest))
        this._helpSearchContentApiRequest = <AtlasApiRequestWithParams>{};
      let params: AtlasParams[] = new Array();
      params.push(new AtlasParams('fields', 'Id,Title,PublishDate'))
      params.push(new AtlasParams('helpSearchByContent', searchKeyBy))

      this._helpSearchContentApiRequest = new AtlasApiRequestWithParams(1, this._defaultNoOfRows, 'Title', SortDirection.Descending, params);
      this._store.dispatch(new LoadHelpAreaSearchContentAction(this._helpSearchContentApiRequest));
      this._totalRecords = this._store.let(fromRoot.getHelpSearchContentCount);
    });

    this._store.let(fromRoot.getHelpSearchContentInfo).takeUntil(this._destructor$).subscribe((val) => {
      this._helpSearchContent = val;
      this._currentRows = !isNullOrUndefined(this._helpSearchContent) ? this._helpSearchContent.count() : 10;
      this._cdRef.markForCheck();
    })
    this._store.let(fromRoot.getHelpSearchContentLoadingStatus).takeUntil(this._destructor$).subscribe((val) => {
      this._loading = val;
      this._cdRef.markForCheck();
    })

  }
  private _checkArticleVisibility(item: HelpContent) {
    let index = this._openedArticles.findIndex((article) => article.Id === item.Id);
    if (index !== -1) {
      return true;
    } else {
      return false;
    }
  }

  onPageChange(pagingInfo: PagingInfo) {
    if (isNullOrUndefined(this._helpSearchContentApiRequest))
      this._helpSearchContentApiRequest = <AtlasApiRequestWithParams>{};
    this._helpSearchContentApiRequest.PageNumber = pagingInfo.PageNumber;
    this._helpSearchContentApiRequest.PageSize = pagingInfo.PageSize;
    this._defaultNoOfRows = pagingInfo.PageSize;
    this._currentPageNumber = pagingInfo.PageNumber;
    this._store.dispatch(new LoadHelpAreaSearchContentAction(this._helpSearchContentApiRequest));
  }


  ngOnDestroy() {
    super.ngOnDestroy();
  }
  getHelpAreaContentbody(helpContent: HelpContent) {
    if (isNullOrUndefined(helpContent.Body)) {
      this._store.dispatch(new LoadHelpSearchAreaContentBodyAction(helpContent.Id));
    }
    let index = this._openedArticles.findIndex((article) => article.Id === helpContent.Id);
    if (index !== -1) {
      this._openedArticles.splice(index, 1);
    } else {
      this._openedArticles.push(helpContent);
    }

  }
  byPassSecurityForHTML(content: string): SafeHtml {
    return replaceDocumentIdWithFileDownload(content, this.sanitizer, true);
  }
  isOpen(item: HelpContent): boolean {
    return this._checkArticleVisibility(item);
  }
}
