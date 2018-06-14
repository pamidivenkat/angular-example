import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { Store } from "@ngrx/store";
import * as fromRoot from '../../../shared/reducers/index';
import { BaseComponent } from '../../../shared/base-component';
import { News } from '../../models/news';
import { LoadNewsAction } from '../../actions/news.actions';
import { isNullOrUndefined } from "util";
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import * as Immutable from 'immutable';

@Component({
  selector: 'news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsComponent extends BaseComponent implements OnInit, OnDestroy {
  //Private Fields
  private _newsSubscription: Subscription;
  private _news: BehaviorSubject<Immutable.List<News>>;
  private _dataLoading: Observable<boolean>;
  //End of Private Fields

  get news(): BehaviorSubject<Immutable.List<News>>{
    return this._news;
  }

  get dataLoading(): Observable<boolean> {
    return this._dataLoading;
  }
  // Public properties

  //End of Public properties
  constructor(
    protected _localeService: LocaleService,
    protected _translationService: TranslationService,
    protected _cdRef: ChangeDetectorRef,
    private _claimsHelper: ClaimsHelperService,
    private _store: Store<fromRoot.State>) {
    super(_localeService, _translationService, _cdRef);
    this._news = new BehaviorSubject<Immutable.List<News>>(Immutable.List([]));
  }

  goToUrl(url: string) {
    window.open(url, '_blank');
  }

  ngOnInit() {
    this._newsSubscription = this._store.let(fromRoot.getNewsData).subscribe((news) => {
      if (isNullOrUndefined(news)) {
        this._store.dispatch(new LoadNewsAction(true));
      } else {
        this._news.next(news);
        this._cdRef.markForCheck();
      }
    });

    this._dataLoading = this._store.let(fromRoot.newsLoadingStatus);
  }

  ngOnDestroy(): void {
    this._newsSubscription.unsubscribe();
  }
}
