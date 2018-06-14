import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { isNullOrUndefined } from 'util';

import { BaseComponent } from '../../../shared/base-component';
import * as fromRoot from '../../../shared/reducers';
import { RiskAssessment } from '../../models/risk-assessment';
import { RiskAssessmentControl } from '../../models/risk-assessment-control';
import { RiskAssessmentService } from '../../services/risk-assessment-service';

@Component({
  selector: 'selected-controls',
  templateUrl: './selected-controls.component.html',
  styleUrls: ['./selected-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectedControlsComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _selectedControls: RiskAssessmentControl[];
  private _currentRiskAssessment: RiskAssessment;
  private _removeConfirmation: boolean;
  private _selectedControl: RiskAssessmentControl;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  // End of Private Fields

  // Public properties
  @Input('selectedControls')
  set selectedControls(value: RiskAssessmentControl[]) {
    this._selectedControls = value;
  }
  get selectedControls(): RiskAssessmentControl[] {
    return this._selectedControls;
  }
  

  get removeConfirmation(): boolean {
    return this._removeConfirmation;
  }

  get selectedControl(): RiskAssessmentControl {
    return this._selectedControl;
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  // End of Public properties

  // Public Output bindings
  @Output('updateControl')
  private _updateControl = new EventEmitter<RiskAssessmentControl>();

  @Output('removeControl')
  private _removeControl = new EventEmitter<RiskAssessmentControl>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _riskAssessmentService: RiskAssessmentService
    , private _store: Store<fromRoot.State>) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  // Private methods
  // End of private methods

  // Public methods.
  updateControl(control: RiskAssessmentControl) {
    this._updateControl.emit(control);
  }
  removeModalClose() {
    this._removeConfirmation = false;
  }

  removeControlConfirm(control: RiskAssessmentControl) {
    this._removeConfirmation = true;
    this._selectedControl = control;
  }
  removeControl(control: RiskAssessmentControl) {
    this._removeConfirmation = false;
    this._removeControl.emit(control);
  }
  getPictureUrl(id: string, isSharedDocument: boolean = false, isHazard: boolean = false) {
    return this._riskAssessmentService.getPictureUrl(id, isSharedDocument, isHazard)
  }
  isMigrated(): boolean {
    return this._riskAssessmentService.isMigrated(this._currentRiskAssessment);
  }

  ngOnInit() {


  }
  // End of public methods



}
