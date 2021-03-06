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
import { MethodStatement, MSProcedure, ProcedureCode } from '../../../models/method-statement';
import { isNullOrUndefined } from 'util';
import { Subscription } from 'rxjs/Rx';

@Component({
  selector: 'safety-procedures',
  templateUrl: './safety-procedures.component.html',
  styleUrls: ['./safety-procedures.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SafetyProceduresComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _triggerStatus: boolean;
  private _methodStatementEntity: MethodStatement;
  private _context: any;
  private _msSafetyProcedures: Array<MSProcedure>;
  private _methodStatementSubscription: Subscription;
  // End of Private Fields

  // getters start
  get triggerStatus() {
    return this._triggerStatus;
  }

  get msSafetyProcedures() {
    return this._msSafetyProcedures;
  }

  get procedureCode() {
    return ProcedureCode.SafetyProcedures;
  }
  // end of getters

  // Public properties
  @Input('methodStatement')
  get methodStatement() {
    return this._methodStatementEntity;
  }
  set methodStatement(val: any) {
    this._methodStatementEntity = val;

    if (!isNullOrUndefined(this._methodStatementEntity)) {
      if (!isNullOrUndefined(this._methodStatementEntity.MSProcedures)) {
        this._msSafetyProcedures = this._methodStatementEntity.MSProcedures;
      } else {
        this._msSafetyProcedures = [];
      }
    }
  }

  @Input('context')
  get context() {
    return this._context;
  }
  set context(val: any) {
    this._context = val;
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
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this.id = 'safetyprocedures';
    this.name = 'safetyprocedures';
  }
  // End of constructor

  // Private methods 
  // End of private methods

  // Public methods
  public triggerMSProcAdd(e) {
    this._triggerStatus = true;
  }

  public onResetTiggerStatus(e) {
    this._triggerStatus = null;
  }

  ngOnInit() {
    this._methodStatementSubscription = this._store.let(fromRoot.getManageMethodStatementData).subscribe((ms) => {
      if (ms) {
        this.methodStatement = ms;
        this._cdRef.markForCheck();
      }
    });
  }
  ngOnDestroy() {
    if (!isNullOrUndefined(this._methodStatementSubscription)) {
      this._methodStatementSubscription.unsubscribe();
    }
  }
  // End of public methods
}
