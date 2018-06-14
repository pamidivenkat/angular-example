import { replaceDocumentIdWithFileDownload } from '../../../home/common/extract-helpers';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { isNullOrUndefined } from 'util';

import { AeLoaderType } from '../../../atlas-elements/common/ae-loader-type.enum';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';
import { IBreadcrumb } from '../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import { BaseComponent } from '../../../shared/base-component';
import * as fromRoot from '../../../shared/reducers';
import { LoadSelectedArticleBodyAction } from '../../actions/help.actions';
import { Article } from '../../models/article';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'whats-new-article-details',
  templateUrl: './whats-new-article-details.component.html',
  styleUrls: ['./whats-new-article-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WhatsNewArticleDetailsComponent extends BaseComponent implements OnInit, OnDestroy {
  private _articleDetails: Article;
  private _backToHelp: boolean = false;
  private _loading: boolean = false;
  private _loaderType: AeLoaderType = AeLoaderType.Bars;
  private _Id: string;
  private _isSlideOut: boolean = false;
  @Input('articleDetails')
  set articleDetails(value: Article) {
    this._articleDetails = value;
  }
  get articleDetails() {
    return this._articleDetails;
  }
 
  @Input('isSlideOut')
  get isSlideOut() {
    return this._isSlideOut;
  }
  set isSlideOut(value: boolean) {
    this._isSlideOut = value;
  }

  @Output('onCancel')
  onCancel: EventEmitter<string>;
  get currentArticleDetails(): Article {
    return this._articleDetails;
  }

  get backToHelp(): boolean {
    return this._backToHelp;
  }
  get loading(): boolean {
    return this._loading;
  }
  get loaderType(): AeLoaderType {
    return this._loaderType;
  }
  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Help;
  }
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _breadcrumbService: BreadcrumbService
    , private _router: ActivatedRoute
    , private _store: Store<fromRoot.State>
    , private sanitizer: DomSanitizer
  ) {
    super(_localeService, _translationService, _cdRef);
    this.onCancel = new EventEmitter<string>();
  }

  ngOnInit() {
    if (!this._isSlideOut) {
      const bcItem: IBreadcrumb = { isGroupRoot: false, group: BreadcrumbGroup.Help, label: 'Latest releases', url: '/help/latest-releases' };
      this._breadcrumbService.add(bcItem);
    }
    this._store.let(fromRoot.getSelectedArticleLoadingStatus).takeUntil(this._destructor$).subscribe((val) => {
      this._loading = val;
      this._cdRef.markForCheck();
    })
    if (isNullOrUndefined(this._articleDetails)) {
      this._router.params.takeUntil(this._destructor$).subscribe((param) => {
        this._Id = param['id'];
      })
      this._store.dispatch(new LoadSelectedArticleBodyAction(this._Id));
      this._store.let(fromRoot.getCurrentWhatsNewLatestReleases).takeUntil(this._destructor$).subscribe((val) => {
        if (!isNullOrUndefined(val)) {
          this._articleDetails = val;
          this._cdRef.markForCheck();
        }

        this._backToHelp = true;
      })
    }
  }

  onArticleDetailsCancel() {
    this.onCancel.emit('cancel');
  }

  updateImageUrl(content: string): SafeHtml {
    let contentAfterImage = replaceDocumentIdWithFileDownload(content, this.sanitizer, true);
    return contentAfterImage;
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}