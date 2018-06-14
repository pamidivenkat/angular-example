import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { PlantAndEquipment } from './../../models/plantandequipment';
import { IBreadcrumb } from '../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { Subscription } from "rxjs/Rx";
import { PlantandequipmentService } from '../../services/plantandequipment.service';
import { isNullOrUndefined } from "util";
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
@Component({
  selector: 'plantandequipment-container',
  templateUrl: './plantandequipment-container.component.html',
  styleUrls: ['./plantandequipment-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlantandequipmentContainerComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _showPlantEquipmentAddUpdateForm: boolean = false;
  private _selectedPlantEquipment: PlantAndEquipment;
  private _showPlantEquipmentViewSlideOut: boolean = false;
  private _showPlantEquipmentUpdateSlideOut: boolean = false;
  private _showPlantEquipmentDeleteModal: boolean = false;
  private _loadSelectedPlantEquipmentSubscription: Subscription;
  private _loadedSelectedPlantEquipment: PlantAndEquipment = new PlantAndEquipment();
  private _action: string;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  // End of Private Fields

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _plantEquipmentService: PlantandequipmentService
    , private _breadcrumbService: BreadcrumbService) {

    super(_localeService, _translationService, _changeDetectordRef);
    // const bcItem: IBreadcrumb = { label: 'Plant & equipment', url: '/plant-and-equipment' };
    // this._breadcrumbService.add(bcItem);
  }
  // End of constructor
  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.PlantEquipment;
  }
  get showPlantEquipmentAddUpdateForm(): boolean {
    return this._showPlantEquipmentAddUpdateForm;
  }
  get selectedPlantEquipment(): PlantAndEquipment {
    return this._selectedPlantEquipment;
  }
  get showPlantEquipmentViewSlideOut(): boolean {
    return this._showPlantEquipmentViewSlideOut;
  }
  get showPlantEquipmentUpdateSlideOut(): boolean {
    return this._showPlantEquipmentUpdateSlideOut;
  }
  get showPlantEquipmentDeleteModal(): boolean {
    return this._showPlantEquipmentDeleteModal;
  }
  get loadSelectedPlantEquipmentSubscription(): Subscription {
    return this._loadSelectedPlantEquipmentSubscription;
  }
  get loadedSelectedPlantEquipment(): PlantAndEquipment {
    return this._loadedSelectedPlantEquipment;
  }
  set action(actionValue: string) {
    this._action = actionValue;
  }
  get action(): string {
    return this._action;
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  // Private methods 

  getBackgroundImage(): string {
    return '/assets/images/lp-plant-equipment.jpg';
  }
  getSlideoutState(): string {
    return (this._showPlantEquipmentAddUpdateForm) ? 'expanded' : 'collapsed';
  }

  addNewPlantAndEquipment() {
    this._loadedSelectedPlantEquipment = new PlantAndEquipment();
    this._action = 'Add';
    this._showPlantEquipmentAddUpdateForm = true;
  }

  onPlantAndEquipmentAdd(e: any) {
    this._showPlantEquipmentAddUpdateForm = false;
  }

  onPlantAndEquipmentAddOrUpdateCancel(e: any) {
    this._showPlantEquipmentAddUpdateForm = false;
  }


  getPlantAndEquipmentSlideoutState() {
    return this._showPlantEquipmentAddUpdateForm || this._showPlantEquipmentViewSlideOut ? 'expanded' : 'collapsed';
  }

  getSlideoutAnimateState() {
    return this._showPlantEquipmentAddUpdateForm || this._showPlantEquipmentViewSlideOut;

  }
  onPlantAndEquipmentlideCancel(event: any) {
    this._showPlantEquipmentDeleteModal = false;
    this._showPlantEquipmentAddUpdateForm = false;
    this._showPlantEquipmentViewSlideOut = false;
    this._action = "";
  }

  onPlantEquipmentDelete(plantEqp: PlantAndEquipment) {
    this._selectedPlantEquipment = plantEqp;
    this._showPlantEquipmentDeleteModal = true;
  }
  onPlantEquipmentView(plantEqp: PlantAndEquipment) {
    this._selectedPlantEquipment = plantEqp;
    this._action = 'view';
    if (isNullOrUndefined(this._loadedSelectedPlantEquipment) || this._selectedPlantEquipment.Id != this._loadedSelectedPlantEquipment.Id) {
      this._plantEquipmentService.loadPlantAndEquipmentDetails(this._selectedPlantEquipment.Id);
    } else {
      this._showPlantEquipmentViewSlideOut = true;
    }
  }
  onPlantEquipmentUpdate(plantEqp: PlantAndEquipment) {
    this._selectedPlantEquipment = plantEqp;
    this._action = 'update';
    if (isNullOrUndefined(this._loadedSelectedPlantEquipment) || this._selectedPlantEquipment.Id != this._loadedSelectedPlantEquipment.Id) {
      this._plantEquipmentService.loadPlantAndEquipmentDetails(this._selectedPlantEquipment.Id);
    } else {
      this._showPlantEquipmentAddUpdateForm = true;
    }
  }

  modalClosed($event) {
    this._showPlantEquipmentDeleteModal = false;
    if ($event == 'yes') {
      this._plantEquipmentService.removePlantEquipment(this._selectedPlantEquipment);
    }
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this._loadSelectedPlantEquipmentSubscription = this._store.let(fromRoot.getSelectedPlantAndEquipment).subscribe((selectedFullEntity) => {
      if (selectedFullEntity) {
        if (this._action == 'update') {
          this._showPlantEquipmentAddUpdateForm = true;
        }
        else if (this._action == 'view') {
          this._showPlantEquipmentViewSlideOut = true;
        }
        this._loadedSelectedPlantEquipment = selectedFullEntity;
      }
    });

  }
  ngOnDestroy() {
    if (this._loadSelectedPlantEquipmentSubscription) {
      this._loadSelectedPlantEquipmentSubscription.unsubscribe();
    }
  }
  // End of public methods
}
