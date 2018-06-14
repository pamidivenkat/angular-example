import { LoadAdvertsAction } from '../../actions/referral.actions';
import { isNull, isNullOrUndefined } from 'util';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs/Rx';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { Advert, AdvertType } from '../../models/advert';
import * as fromRoot from './../../../shared/reducers/index';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
  OnDestroy
} from '@angular/core';

@Component({
  selector: 'advert',
  templateUrl: './advert.component.html',
  styleUrls: ['./advert.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})

export class AdvertComponent extends BaseComponent implements OnInit, OnDestroy {
  private _isReferral: boolean = false;
  private _adverts: Array<Advert>;
  private _isDataLoaded: boolean;
  private _advertSubscription: Subscription;
  private _advertStatusSubscription: Subscription;

  get isDataLoaded(): boolean {
    return this._isDataLoaded;
  }

  get adverts(): Array<Advert> {
    return this._adverts;
  }

  private _openReferralForm() {
    this._isReferral = true;
  }

  getSlideoutState(): string {
    return this._isReferral ? 'expanded' : 'collapsed';
  }

  getSlideoutAnimateState(): boolean {
    return this._isReferral;
  }

  onReferCancel($event) {
    this._isReferral = false;
  }

  private onReferSubmit($event) {
    this._isReferral = false;
  }

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>) {
    super(_localeService, _translationService, _cdRef);
    this._isDataLoaded = false;
  }

  ngOnInit() {
    this._advertSubscription = this._store.let(fromRoot.getAdverts).subscribe(adverts => {
      if (isNullOrUndefined(adverts)) {
        this._store.dispatch(new LoadAdvertsAction(true));
      }
      else {
        this._adverts = adverts;
      }
    });

    this._advertStatusSubscription = this._store.let(fromRoot.getAdvertsStatus).subscribe((status) => {
      this._isDataLoaded = status;
      this._cdRef.markForCheck();
    });
  }

  ngOnDestroy() {
    this._advertSubscription.unsubscribe();
    this._advertStatusSubscription.unsubscribe();
  }

  _onClick(advertType: number, url: string) {
    if (AdvertType.Referral === advertType) {
      this._openReferralForm();
    } else {
      window.open(url, '_blank');
    }
  }

  private _getPictureUrl(pictureId: string): string {
    return "/filedownload?documentId=" + pictureId + "&isSystem=true";
  }

}
