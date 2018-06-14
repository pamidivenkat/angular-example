import {
  Component
  , OnInit
  , ViewEncapsulation
  , ChangeDetectionStrategy
  , OnDestroy
  , ChangeDetectorRef
  , Output
  , EventEmitter,
  Input
} from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { MSProcedure } from '../../../models/method-statement';

@Component({
  selector: 'procedure-quick-view',
  templateUrl: './procedure-quick-view.component.html',
  styleUrls: ['./procedure-quick-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ProcedureQuickViewComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private fields start
  private _msProcedure: MSProcedure;
  // End of private fields

  // getters start
  // end of getters

  // public properties
  @Input('msProcedure')
  set msProcedure(val: MSProcedure) {
    this._msProcedure = val;
  }
  get msProcedure() {
    return this._msProcedure;
  }
  // end of public properties

  // public output bindings
  @Output()
  onQuickViewCancel: EventEmitter<boolean>;
  // End of Public Output bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this.onQuickViewCancel = new EventEmitter<boolean>();

    this.id = 'procedurequickview';
    this.name = 'procedurequickview';
  }
  // End of constructor

  // public methods start
  public closeQuickView() {
    this.onQuickViewCancel.emit(true);
  }

  ngOnInit() {
  }

  ngOnDestroy() {

  }
  // end of public methods

}
