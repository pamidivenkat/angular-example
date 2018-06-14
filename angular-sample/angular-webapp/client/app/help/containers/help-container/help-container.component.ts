import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeLoaderType } from '../../../atlas-elements/common/ae-loader-type.enum';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';
import { IBreadcrumb } from '../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import { WhatsNewCategory } from '../../../home/models/whats-new';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import * as fromRoot from '../../../shared/reducers';
import { LoadHelpAreaContentsAction, LoadLatestReleasesAction } from '../../actions/help.actions';
import { Article } from '../../models/article';
import { HelpContent } from '../../models/helparea';

@Component({
  selector: 'help-container',
  templateUrl: './help-container.component.html',
  styleUrls: ['./help-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class HelpContainerComponent extends BaseComponent implements OnInit {

  private _latestReleases: Observable<Immutable.List<Article>>;
  private _latestReleasesApiRequest: AtlasApiRequestWithParams;
  private _isWhatsNewArticleSelected: boolean = false;
  private _currentWhatsNewArticle: Article;
  private _firstName: string = this._claimsHelper.getUserFirstName();
  private _helpcontent: Observable<Immutable.List<HelpContent>>;
  private _showHelpAreaContentSlider: boolean = false;
  private _helpAreaName: string = "";
  private _searchTerm$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private _loading: boolean = false;
  private _loaderType: AeLoaderType = AeLoaderType.Bars;
  private _searchFormGroup: FormGroup;

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Help;
  }
  get loading(): boolean {
    return this._loading;
  }
  get loaderType(): AeLoaderType {
    return this._loaderType;
  }

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _router: Router
    , private _claimsHelper: ClaimsHelperService
    , private _breadcrumbService: BreadcrumbService
    , private _fb: FormBuilder) {
    super(_localeService, _translationService, _cdRef);
    const bcItem: IBreadcrumb = { isGroupRoot: true, group: BreadcrumbGroup.Help, label: 'Help', url: '/help' };
    this._breadcrumbService.add(bcItem);
  }

  get HelpAreaName() {
    return this._helpAreaName;
  }
  get latestReleases(): Observable<Immutable.List<Article>> {
    return this._latestReleases;
  }
  get HelpcontentVM() {
    return this._helpcontent;
  }
  get isWhatsNewArticleSelected() {
    return this._isWhatsNewArticleSelected;
  }
  get currentWhatsNewArticle() {
    return this._currentWhatsNewArticle;
  }
  get firstName() {
    return this._firstName;
  }
  get searchTerm$(): BehaviorSubject<string> {
    return this._searchTerm$;
  }
  getWhatsNewArticleSlideoutAnimateState(): boolean {
    return this._isWhatsNewArticleSelected;
  }

  getWhatsNewArticleSlideoutState(): string {
    return this._isWhatsNewArticleSelected ? 'expanded' : 'collapsed';
  }
  onWhatsNewArticleSlideoutCancel() {
    return this._isWhatsNewArticleSelected = false;
  }

  get searchFormGroup(): FormGroup {
    return this._searchFormGroup;
  }

  ngOnInit() {
    this._searchFormGroup = this._fb.group(
      { searchText: [{ value: '', disabled: false }, null] }
    );
    let params: AtlasParams[] = new Array();
    params.push(new AtlasParams('fields', 'Id,Title,PublishDate,Body,Category'));
    params.push(new AtlasParams('category', WhatsNewCategory.Release));
    this._latestReleasesApiRequest = new AtlasApiRequestWithParams(1, 5, 'PublishDate', SortDirection.Descending, params);
    
    this._store.dispatch(new LoadLatestReleasesAction(this._latestReleasesApiRequest));
    this._latestReleases = this._store.let(fromRoot.getWhatsNewLatestReleases);
  }

  viewAllLatestReleases() {
    this._router.navigateByUrl('/help/latest-releases');
  }
  getWhatsNewArticleDetails(item: Article) {
    this._isWhatsNewArticleSelected = true;
    this._currentWhatsNewArticle = item;
  }
  onShowHelpAreaContent(helpArea: any) {
    this._helpAreaName = helpArea.Name;
    let params: AtlasParams[] = new Array();
    params.push(new AtlasParams('id', helpArea.Id))
    params.push(new AtlasParams('fields', 'Id,Title'))
    let helpAreaContentApiRequest = new AtlasApiRequestWithParams(0, 0, 'Title', SortDirection.Ascending, params);
    this._store.dispatch(new LoadHelpAreaContentsAction(helpAreaContentApiRequest));
    this._helpcontent = this._store.let(fromRoot.getHelpContentInfo);
    this._showHelpAreaContentSlider = true;
  }
  getHelpAreaSlideoutAnimateState(): boolean {
    return this._showHelpAreaContentSlider === true;
  }
  getHelpAreaSlideoutState(): string {
    return this._showHelpAreaContentSlider === true ? 'expanded' : 'collapsed';
  }
  onHelpContentCancel($event) {
    this._showHelpAreaContentSlider = $event;
  }
  public submitWhenClick($event) {
    let text = this._searchFormGroup.controls['searchText'].value;

    if (!isNullOrUndefined(text)) {
      if (text != this._searchTerm$.value) {
        this.search(text);
      }
    }
  }
  public submitWhenEnter($event) {
    if ($event.which == 13 || $event.keyCode == 13) {
      if ($event.target.value != this._searchTerm$.value) {
        this.search($event.target.value);
      }
    }
  }
  public search(searchString: string) {
    let navigateUrl = '/help/search-help-content';
    navigateUrl += '/' + searchString;
    this._router.navigateByUrl(navigateUrl);
  }
}
