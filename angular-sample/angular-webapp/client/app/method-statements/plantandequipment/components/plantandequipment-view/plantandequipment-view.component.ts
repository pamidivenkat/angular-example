import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute } from "@angular/router";
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { PlantAndEquipment } from "../../models/plantandequipment";


@Component({
  selector: 'plantandequipment-view',
  templateUrl: './plantandequipment-view.component.html',
  styleUrls: ['./plantandequipment-view.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlantandequipmentViewComponent extends BaseComponent implements OnInit, OnDestroy  {
  // Private Fields
  private _plantAndEquipment: PlantAndEquipment;
  // End of Private Fields

  // Public properties
  // End of Public properties

  // Public Output bindings
  @Output() onCancel = new EventEmitter();

  @Input('SelectedPlantEquipment')
  set vm(value: PlantAndEquipment) {
    this._plantAndEquipment = value;
  }
  get vm() {
    return this._plantAndEquipment;
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

  get plantAndEquipment(){
    return this._plantAndEquipment;
  }
  ngOnInit(){

  }
  ngOnDestroy(){
    
  }
  // End of public methods

}
