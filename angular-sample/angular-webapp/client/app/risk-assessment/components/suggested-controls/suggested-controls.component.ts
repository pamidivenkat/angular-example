import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { RiskAssessmentControl } from '../../models/risk-assessment-control';
import { RiskAssessmentService } from '../../services/risk-assessment-service';
import { RiskAssessment } from '../../models/risk-assessment';
import { ControlsCategory } from '../../common/controls-category-enum';
import { AddControl } from '../../actions/risk-assessment-actions';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../shared/reducers';

@Component({
  selector: 'suggested-controls',
  templateUrl: './suggested-controls.component.html',
  styleUrls: ['./suggested-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuggestedControlsComponent extends BaseComponent implements OnInit {

  // Private Fields
  private _suggestedControls: RiskAssessmentControl[];
  private _currentRiskAssessment: RiskAssessment;
  private _selectedHazardId: string;
  // End of Private Fields

  // Public properties
  @Input('suggestedControls')
  set suggestedControls(value: RiskAssessmentControl[]) {
    this._suggestedControls = value;
  }
  get suggestedControls(): RiskAssessmentControl[] {
    return this._suggestedControls;
  }
 
  @Input('currentRiskAssessment')
  set currentRiskAssessment(value: RiskAssessment) {
    this._currentRiskAssessment = value;
  }
  get currentRiskAssessment(): RiskAssessment {
    return this._currentRiskAssessment;
  }
 

  @Input('selectedHazardId')
  get selectedHazardId(): string {
    return this._selectedHazardId;
  }
  set selectedHazardId(val: string) {
    this._selectedHazardId = val;
  }
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _riskAssessmentService: RiskAssessmentService) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  // Private methods
  private _isCOSHH(): boolean {
    return this._riskAssessmentService.isCOSHH(this._currentRiskAssessment);
  }

  private _raControlsCategoryType(): number {
    return this._isCOSHH() ? ControlsCategory['COSHH Control'] : ControlsCategory['General Control'];
  }
  // End of private methods

  // Public methods
  getPictureUrl(id: string, isSharedDocument: boolean = false, isHazard: boolean = false) {
    return this._riskAssessmentService.getPictureUrl(id, isSharedDocument, isHazard)
  }

  addControlToRiskAssessment(control: RiskAssessmentControl) {
    let controlToAdd = new RiskAssessmentControl();
    controlToAdd.Name = control.Name;
    controlToAdd.PictureId = control.PictureId;
    controlToAdd.Description = control.Description;
    controlToAdd.PrototypeId = control.Id;
    controlToAdd.IsSharedPrototype = control.IsExample
    controlToAdd.RiskAssessmentId = this._currentRiskAssessment.Id;
    controlToAdd.RiskAssessmentHazardId = this._selectedHazardId;
    controlToAdd.Category = this._raControlsCategoryType();
    this._store.dispatch(new AddControl(controlToAdd))
  }

  ngOnInit() {

  }
  // End of public methods
}
