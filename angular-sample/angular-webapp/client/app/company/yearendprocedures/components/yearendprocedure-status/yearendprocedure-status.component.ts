import {
  Component
  , OnInit
  , ChangeDetectorRef
  , OnDestroy
  , ChangeDetectionStrategy
  , ViewEncapsulation
  , Input
  , Output
  , EventEmitter
} from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { BaseComponent } from './../../../../shared/base-component';
import { AeClassStyle } from './../../../../atlas-elements/common/ae-class-style.enum';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { YearEndProcedureModel, YearEndProcedureStatus } from './../../models/yearendprocedure-model';
import { getYEPStatusList } from './../../common/extract-helpers';
import { isNullOrUndefined } from 'util';
import { Subscription, BehaviorSubject } from 'rxjs/Rx';
import { AeLoaderType } from './../../../../atlas-elements/common/ae-loader-type.enum';

@Component({
  selector: 'yearendprocedure-status',
  templateUrl: './yearendprocedure-status.component.html',
  styleUrls: ['./yearendprocedure-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class YearendprocedureStatusComponent extends BaseComponent implements OnInit, OnDestroy {
  // private field declarations start
  private _yearEndProcedureData: YearEndProcedureModel;
  private _statusMap: Map<number, string>;
  private _yearEndProcedureSubscription: Subscription;
  private _loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // end of private fields

  // getters start
  public get currentStatus(): string {
    if (!isNullOrUndefined(this._yearEndProcedureData) &&
      !isNullOrUndefined(this._statusMap)) {
      return this._statusMap.get(this._yearEndProcedureData.Status);
    }
    return '';
  }

  public get isReviewConfirmedState() {
    if (!isNullOrUndefined(this._yearEndProcedureData)) {
      return this._yearEndProcedureData.Status === YearEndProcedureStatus.ReviewConfirmed;
    }
    return false;
  }

  public get nextReviewDate() {
    if (!isNullOrUndefined(this._yearEndProcedureData)) {
      let date = new Date(this.yearEndProcedure.FiscalYearData.EndDate);
      date.setDate(date.getDate() + 1);
      date.setFullYear(date.getFullYear() + 1);
      return date;
    }
    return null;
  }

  public get yearEndProcedure() {
    return this._yearEndProcedureData;
  }

  public get loaderType() {
    return AeLoaderType.Bars;
  }
  // end of getters

  @Input('loading')
  public get loading() {
    return this._loading.getValue();
  }
  public set loading(val: boolean) {
    this._loading.next(val);
  }

  // output bindings start here
  @Output()
  runYEP: EventEmitter<any> = new EventEmitter<any>();
  // end of output bindings

  // constrcutor starts
  constructor(protected _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService
    , _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>) {
    super(_localeService, _translationService, _changeDetector);

    this._statusMap = getYEPStatusList();
  }
  // end of constructor

  // public methods
  ngOnInit() {
    this._yearEndProcedureSubscription = this._store.let(fromRoot.getYearEndProcedureData).subscribe((data) => {
      if (!isNullOrUndefined(data)) {
        this._yearEndProcedureData = data;
        this._cdRef.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._yearEndProcedureSubscription)) {
      this._yearEndProcedureSubscription.unsubscribe();
    }
  }
  // end of public methods
}
