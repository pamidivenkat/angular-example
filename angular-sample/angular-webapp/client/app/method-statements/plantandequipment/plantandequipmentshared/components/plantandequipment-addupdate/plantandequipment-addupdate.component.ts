import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { BaseComponent } from './../../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute } from "@angular/router";
import { ClaimsHelperService } from './../../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../../shared/reducers';
import * as Immutable from 'immutable';
import { FormGroup, FormBuilder } from "@angular/forms";
import { Observable } from "rxjs/Rx";
import { IFormBuilderVM, IFormFieldWrapper } from './../../../../../shared/models/iform-builder-vm';
import { PlantAndEquipment } from '../../../models/plantandequipment';
import { PlantAndEquipmentForm } from '../../../models/plantandequipment-form';
import { PlantandequipmentService } from './../../../services/plantandequipment.service';


@Component({
  selector: 'plantandequipment-addupdate',
  templateUrl: './plantandequipment-addupdate.component.html',
  styleUrls: ['./plantandequipment-addupdate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlantandequipmentAddupdateComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields  
  private _addUpdatePlantEquipmentForm: FormGroup;
  private _submitted: boolean = false;
  private _formName: string;
  private _addUpdatePlantEquipmentFormVM: IFormBuilderVM;
  private _action: string;
  private _plantAndEquipmentToSave: PlantAndEquipment = new PlantAndEquipment();
  private _fields: Array<IFormFieldWrapper<any>>;
  private _formFields: IFormFieldWrapper<any>[];
  private _procedureLoading$: Observable<boolean>;
  // End of Private Fields

  // Public properties
  // End of Public properties

  // Public Output 
  @Output('onCancel') _onPlantAndEquipmentCancel: EventEmitter<string>;
  // End of Public Output bindings

  @Input('SelectedPlantEquipment')
  set SelectedPlantEquipment(value: PlantAndEquipment) {
    this._plantAndEquipmentToSave = value;
  }
  get SelectedPlantEquipment() {
    return this._plantAndEquipmentToSave;
  }

  @Input('action')
  set action(value: string) {
    this._action = value;
  }
  get action() {
    return this._action;
  }

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _plantEquipmentService: PlantandequipmentService
    , private _fb: FormBuilder
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this._onPlantAndEquipmentCancel = new EventEmitter<string>();

  }
  // End of constructor

  // Private methods  
  formButtonNames() {
    return (this._action == 'Add' ? { Submit: 'Add' } : { Submit: 'update' });
  }
  // End of private methods

  // Public methods

  get addUpdatePlantEquipmentForm() {
    return this._addUpdatePlantEquipmentForm;
  }

  get addUpdatePlantEquipmentFormVM() {
    return this._addUpdatePlantEquipmentFormVM;
  }

  ngOnInit() {
    this._formName = 'addUpdateForm';
    this._addUpdatePlantEquipmentFormVM = new PlantAndEquipmentForm(this._formName, this._plantAndEquipmentToSave);
    this._fields = this._addUpdatePlantEquipmentFormVM.init();
  }
  ngOnDestroy() {

  }
  // End of public methods

  onCancel(e) {
    this._addUpdatePlantEquipmentForm.reset(); //clear form.
    this._onPlantAndEquipmentCancel.emit('Cancel');
  }

  onSubmit($event) {
    this._submitted = true;
    if (this._addUpdatePlantEquipmentForm.valid) {
      let plantAndEquipmentToSave: PlantAndEquipment = Object.assign({}, this._plantAndEquipmentToSave, <PlantAndEquipment>this._addUpdatePlantEquipmentForm.value);
      if (this._action == 'Add') {
        this._plantEquipmentService.savePlantEquipmentDetails(plantAndEquipmentToSave);
      } else {
        this._plantEquipmentService.updatePlantEquipmentDetails(plantAndEquipmentToSave);
      }
      this._onPlantAndEquipmentCancel.emit('Cancel');
      this._addUpdatePlantEquipmentForm.reset();

    }

  }

  onFormInit(fg: FormGroup) {
    this._addUpdatePlantEquipmentForm = fg;
  }

  title() {
    if (this._action == 'Add') {
      return "ADD_PLANT_EQUIPMENT";
    } else {
      return "UPDATE_PLANT_EQUIPMENT";
    }
  }
}
