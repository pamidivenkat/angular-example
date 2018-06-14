import { Component, OnInit, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from '../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';

import { Router, ActivatedRoute } from "@angular/router";
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../shared/reducers';
import * as Immutable from 'immutable';
import { COSHHInventory } from "../../../coshh-inventory/models/coshh-inventory";
import { Subscription } from 'rxjs/Subscription';
import { isNullOrUndefined } from 'util';
import { CoshhInventoryForm } from "../../../coshh-inventory/models/coshhinventory.form";

import { FormGroup, FormBuilder } from "@angular/forms";
import { Observable } from "rxjs/Rx";
import { IFormBuilderVM, IFormFieldWrapper } from "../../../shared/models/iform-builder-vm";

import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import * as coshhInventoryActions from '../../../coshh-inventory/actions/coshh-inventory.actions';
import { IBreadcrumb } from "../../../atlas-elements/common/models/ae-ibreadcrumb.model";
import { BreadcrumbService } from "../../../atlas-elements/common/services/breadcrumb-service";
import { AeClassStyle } from "../../../atlas-elements/common/ae-class-style.enum";
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';

@Component({
  selector: "app-coshh-inventory-container",
  templateUrl: "./coshh-inventory-container.component.html",
  styleUrls: ["./coshh-inventory-container.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CoshhInventoryContainerComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _showCoshhInventoryAddUpdateForm: boolean = false;
  private _selectedCoshhInventory: COSHHInventory;
  private _showCoshhInventoryViewSlideOut: boolean = false;
  private _showCoshhInventoryUpdateSlideOut: boolean = false;
  private _showCoshhInventoryDeleteModal: boolean = false;
  private _loadSelectedCoshhInventorySubscription: Subscription;
  private _loadedSelectedCoshhInventory: COSHHInventory = new COSHHInventory();
  private _action: string;
  private _lightClass: AeClassStyle = AeClassStyle.Light;

  get showCoshhInventoryAddUpdateForm(): boolean{
    return this._showCoshhInventoryAddUpdateForm;
  }

  get loadedSelectedCoshhInventory(): COSHHInventory{
    return this._loadedSelectedCoshhInventory;
  }

  get action(): string{
    return this._action;
  }

  get showCoshhInventoryDeleteModal(): boolean{
    return this._showCoshhInventoryDeleteModal;
  }

  get selectedCoshhInventory(): COSHHInventory{
    return this._selectedCoshhInventory;
  }

  get lightClass(): AeClassStyle{
    return this._lightClass;
  }

  get showCoshhInventoryViewSlideOut(): boolean{
    return this._showCoshhInventoryViewSlideOut;
  }
  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.COSHH;
}


  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
     , private _breadcrumbService: BreadcrumbService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
  }
  // End of constructor

  // Private methods  
  private _getSlideoutState(): string {
    return (this._showCoshhInventoryAddUpdateForm) ? 'expanded' : 'collapsed';
  }

  addNewCoshhInventory() {
    this._loadedSelectedCoshhInventory = new COSHHInventory();
    this._action = 'Add';
    this._showCoshhInventoryAddUpdateForm = true;
  }

  getCoshhInventorySlideoutState() {
    return this._showCoshhInventoryAddUpdateForm || this._showCoshhInventoryViewSlideOut ? 'expanded' : 'collapsed';
  }
  
  getSlideoutAnimateState() {
    return this._showCoshhInventoryAddUpdateForm || this._showCoshhInventoryViewSlideOut;

  }
  onCoshhInventorySlideCancel(event: string) {
    this._showCoshhInventoryDeleteModal = false;
    this._showCoshhInventoryAddUpdateForm = false;
    this._showCoshhInventoryViewSlideOut = false;
    this._action = "";
  }

  onCoshhInventoryDelete(coshhInventoryDelete: COSHHInventory) {
    this._selectedCoshhInventory = coshhInventoryDelete;
    this._showCoshhInventoryDeleteModal = true;
  }

  onCoshhInventoryView(coshhInventoryView: COSHHInventory) {
    this._action = 'view';
    this._selectedCoshhInventory = coshhInventoryView;
    if (isNullOrUndefined(this._loadedSelectedCoshhInventory) || this._selectedCoshhInventory.Id != this._loadedSelectedCoshhInventory.Id) {
      this._store.dispatch(new coshhInventoryActions.ViewCoshhInventoryAction(this._selectedCoshhInventory.Id));

    } else {
      this._showCoshhInventoryViewSlideOut = true;
    }
  }

  onCoshhInventoryUpdate(coshhInventory: COSHHInventory) {
    this._selectedCoshhInventory = coshhInventory;
    this._action = 'update';
    if (isNullOrUndefined(this._loadedSelectedCoshhInventory) || this._selectedCoshhInventory.Id != this._loadedSelectedCoshhInventory.Id) {
      this._store.dispatch(new coshhInventoryActions.ViewCoshhInventoryAction(this._selectedCoshhInventory.Id));
    } else {
      this._showCoshhInventoryAddUpdateForm = true;
    }
  }

  onCoshhInventory(coshhInventoryToSave: COSHHInventory) {
    if (this._action == 'Add') {
      this._store.dispatch(new coshhInventoryActions.AddCOSHHInventoryAction(coshhInventoryToSave));
    } else {
      this._store.dispatch(new coshhInventoryActions.UpdateCOSHHInventoryAction(coshhInventoryToSave));
    }
    this._loadedSelectedCoshhInventory = null;
    this._showCoshhInventoryAddUpdateForm = false;
  }

  modalClosed($event) {
    this._showCoshhInventoryDeleteModal = false;
    if ($event == 'yes') {
      this._store.dispatch(new coshhInventoryActions.DeleteCOSHHInventoryAction(this._selectedCoshhInventory));
    }
  }

  // Public methods
  ngOnInit() {
    this._loadSelectedCoshhInventorySubscription = this._store.let(fromRoot.getCOSHHInventoryForSelectedIdData).subscribe((selectedFullEntity) => {
      if (selectedFullEntity) {
        if (this._action == 'update') {
          this._showCoshhInventoryAddUpdateForm = true;
        }
        else if (this._action == 'view') {
          this._showCoshhInventoryViewSlideOut = true;
        }
        this._loadedSelectedCoshhInventory = selectedFullEntity;
      }
    });
  }

  ngOnDestroy() {
    if (this._loadSelectedCoshhInventorySubscription) {
      this._loadSelectedCoshhInventorySubscription.unsubscribe();
    }
  }
}
