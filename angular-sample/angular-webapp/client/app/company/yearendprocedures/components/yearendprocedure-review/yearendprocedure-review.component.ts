import {
  Component
  , OnInit
  , ChangeDetectorRef
  , OnDestroy
  , ChangeDetectionStrategy
  , ViewEncapsulation
  , Input,
  Output,
  EventEmitter
} from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { BaseComponent } from './../../../../shared/base-component';
import { AeClassStyle } from './../../../../atlas-elements/common/ae-class-style.enum';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { YearEndProcedureModel } from './../../models/yearendprocedure-model';
import { isNullOrUndefined } from 'util';
import { Subscription } from 'rxjs/Rx';

@Component({
  selector: 'yearendprocedure-review',
  templateUrl: './yearendprocedure-review.component.html',
  styleUrls: ['./yearendprocedure-review.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class YearendprocedureReviewComponent extends BaseComponent implements OnInit, OnDestroy {
  // private field declarations start
  private _yearEndProcedureData: YearEndProcedureModel;
  private _context: any;
  private _yearEndProcedureSubscription: Subscription;
  // end of private fields

  // getters start
  public get lightClass() {
    return AeClassStyle.Light;
  }

  public get yearEndProcedure() {
    return this._yearEndProcedureData;
  }
  // end of getters

  // Input properties start
  @Input('context')
  public get context() {
    return this._context;
  }
  public set context(val: any) {
    this._context = val;
  }
  // end of input properties

  // output properties start
  @Output()
  continueEvent: EventEmitter<any> = new EventEmitter<any>();
  // end of output properties

  // constrcutor starts
  constructor(protected _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService
    , _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>) {
    super(_localeService, _translationService, _changeDetector);
  }
  // end of constructor

  // public methods
  public completeYearEndProcedure() {
    this.continueEvent.next(this._context);
  }

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
