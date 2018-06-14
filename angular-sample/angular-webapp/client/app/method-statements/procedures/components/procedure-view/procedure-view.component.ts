import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute } from "@angular/router";
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { Procedure } from "../../../../method-statements/procedures/models/procedure";

@Component({
  selector: 'procedure-view',
  templateUrl: './procedure-view.component.html',
  styleUrls: ['./procedure-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ProcedureViewComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _procedure: Procedure;
  // End of Private Fields

  // Public properties
  // End of Public properties

  // Public Output bindings
  @Output() onCancel = new EventEmitter();

  @Input('vm')
  set vm(value: Procedure) {
    this._procedure = value;
  }
  get vm() {
    return this._procedure;
  }

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
  }
  // End of constructor

  // Private methods  

  onFormClosed() {
    this.onCancel.emit("close");
  }
  // End of private methods

  // Public methods
  ngOnInit() {


  }
  ngOnDestroy() {

  }
  // End of public methods

}
