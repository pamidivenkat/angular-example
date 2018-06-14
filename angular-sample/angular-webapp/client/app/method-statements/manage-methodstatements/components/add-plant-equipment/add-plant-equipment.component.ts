import { StringHelper } from './../../../../shared/helpers/string-helper';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute } from "@angular/router";
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { AeClassStyle } from "../../../../atlas-elements/common/ae-class-style.enum";
import { AtlasApiRequest } from './../../../../shared/models/atlas-api-response';
import { SortDirection } from './../../../../atlas-elements/common/models/ae-sort-model';
import { PlantandequipmentService } from '../../../../method-statements/plantandequipment/services/plantandequipment.service';
import { Observable } from "rx";
import { PlantAndEquipment } from '../../../../method-statements/plantandequipment/models/plantandequipment';
import { Subscription } from "rxjs/Rx";
import { isNullOrUndefined } from "util";
import { BehaviorSubject, Subject } from 'rxjs/Rx';
import { AeDatasourceType } from './../../../../atlas-elements/common/ae-datasource-type';
import { AeAutoCompleteModel } from './../../../../atlas-elements/common/models/ae-autocomplete-model';
import { IFormBuilderVM, IFormFieldWrapper } from '../../../../shared/models/iform-builder-vm';
import { FormGroup, FormBuilder } from "@angular/forms";
import { PlantAndEquipmentForm } from '../../models/plant-equipment-form';

@Component({
  selector: 'add-plant-equipment',
  templateUrl: './add-plant-equipment.component.html',
  styleUrls: ['./add-plant-equipment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AddPlantEquipmentComponent extends BaseComponent implements OnInit, OnDestroy {

  private _slideoutState: boolean;
  private darkClass: AeClassStyle = AeClassStyle.Dark;
  private _pageNumber: number = 1;
  private _pageSize: number = 9999;
  private _sortField: string = 'Name';
  private _sortDirection: SortDirection = SortDirection.Ascending;
  private _plantEquipmentList: Array<PlantAndEquipment>;
  private _plantEquipmentIds: Array<any>;
  private _plantEquipmentSelectedList: Array<PlantAndEquipment>;
  private _plantEquipmentListTemp: Array<PlantAndEquipment>;
  private _plantEquipmentListSubscription: Subscription;
  private _plantEquipmentListSubscriptionOne: Subscription;
  private _action: string = 'Add';
  private _dsType: AeDatasourceType = AeDatasourceType.Local;
  private _selectedIdList: PlantAndEquipment[];
  private _selectedList: Array<string>;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _plantAndEquipmentFormVM: IFormBuilderVM;
  private _plantAndEquipmentForm: FormGroup;
  private _formName: string;
  private _fields: Array<IFormFieldWrapper<any>>;
  private _dataInit: boolean = false;

  @Input('SelectedList')
  get SelectedList() {
    return this._selectedList;
  }
  set SelectedList(val: Array<string>) {
    if (val.length) {
      this._selectedList = val;
    }
  }

  @Output('displayGridData')
  _selectedGridList: EventEmitter<Array<PlantAndEquipment>>;

  @Output('displayGridIdData')
  _selectedGridId: EventEmitter<Array<string>>;

  @Output('aeClose')
  private _aeClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _plantEquipmentService: PlantandequipmentService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this._selectedGridList = new EventEmitter<Array<PlantAndEquipment>>();
    this._selectedGridId = new EventEmitter<Array<string>>();
  }

  openPlantAndEquipmentAddSlideOut() {
    this._slideoutState = true;
  }

  closePlantAndEquipmentSlideOut(e) {
    this._aeClose.emit(false);
  }

  closePlantAndEquipmentAddSlideOut(e) {
    this._slideoutState = false;
  }

  title() {
    return "MANAGE_METHOD_STM.PLANT-EQUIPMENT.BANNER_ADD_ITEMS";
  }

  formButtonNames() {
    return { Submit: 'Add' };
  }

  onFormInit(fg: FormGroup) {
    this._dataInit = true;
    this._plantAndEquipmentForm = fg;
    this._plantAndEquipmentForm.get('plantAndEquipment').valueChanges.subscribe((selectedItem) => {
      let ele = [];
      if (!isNullOrUndefined(selectedItem) && selectedItem.length > 0) {
        if (isNullOrUndefined(selectedItem[0].Id)) {
          selectedItem.map((element) => {
            let empDataFilter = this._plantEquipmentList.filter((data) => { return data.Id === element; });
            ele.push(empDataFilter[0]);
          });
          this._plantEquipmentIds = selectedItem;
          this._selectedIdList = ele;
        } else {
          selectedItem.map((element) => { ele.push(element.Id); });
          this._selectedIdList = selectedItem;
          this._plantEquipmentIds = ele;
        }
      } else {
        this._selectedIdList = [];
      }
    });

  }

  onSubmitPlantAndEquipmentForm(e) {
    this._selectedGridList.emit(this._selectedIdList);
    this._selectedGridId.emit(this._plantEquipmentIds);
    this._slideoutState = false;
    this._aeClose.emit(false);
    this._selectedIdList = [];
  }

  get plantAndEquipmentFormVM() {
    return this._plantAndEquipmentFormVM;
  }

  get slideoutState() {
    return this._slideoutState;
  }

  getSlideoutState(): string {
    return this._slideoutState ? 'expanded' : 'collapsed';
  }

  get plantEquipmentList(): PlantAndEquipment[] {
    return this._plantEquipmentList;
  }

  get dsType() {
    return this._dsType;
  }

  get lightClass() {
    return this._lightClass;
  }

  get action() {
    return this._action;
  }

  ngOnInit() {
    this._formName = 'addPlantAndEquipmentForm';
    this._plantAndEquipmentFormVM = new PlantAndEquipmentForm(this._formName);
    this._fields = this._plantAndEquipmentFormVM.init();

    this._plantEquipmentService.loadPlantAndEquipmentList(new AtlasApiRequest(this._pageNumber, this._pageSize, this._sortField, this._sortDirection));
    this._plantEquipmentListSubscription = this._store.let(fromRoot.getPlantAndEquipmentList).takeUntil(this._destructor$).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._plantEquipmentList = res.toArray();
        if (!isNullOrUndefined(this._selectedList)) {
          this._selectedList.forEach((Id, index) => {
            let flag = this._plantEquipmentList.find(flag =>
              flag.Id === Id
            );
            if (!isNullOrUndefined(flag)) {
              this._plantEquipmentList.splice(this._plantEquipmentList.indexOf(flag), 1);
            }
          });
        }
        let plantAndEquipmentValue = this._fields.find(f => f.field.name === 'plantAndEquipment');
        (<BehaviorSubject<Array<PlantAndEquipment>>>plantAndEquipmentValue.context.getContextData().get('items')).next(this._plantEquipmentList);
      }
    });

    this._plantEquipmentListSubscriptionOne = this._store.let(fromRoot.getSelectedPlantAndEquipment).takeUntil(this._destructor$).subscribe((res) => {
      if (!isNullOrUndefined(res) && this._dataInit) {
        if (!isNullOrUndefined(this._selectedIdList)) {
          this._selectedIdList.push(res);
          this._plantEquipmentIds.push(res.Id);
        } else {
          let ele = []; let peele = [];
          ele.push(res); peele.push(res.Id);
          this._selectedIdList = ele;
          this._plantEquipmentIds = peele;
        }
        if (!isNullOrUndefined(this._plantAndEquipmentForm)) {
          this._plantAndEquipmentForm.patchValue({
            plantAndEquipment: (!isNullOrUndefined(this._selectedIdList)) ? this._selectedIdList : null,
          });
        }
        this._changeDetectordRef.markForCheck();
      }
    });

  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
