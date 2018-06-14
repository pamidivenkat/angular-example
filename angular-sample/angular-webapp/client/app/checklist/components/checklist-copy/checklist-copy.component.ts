import { RouteParams } from './../../../shared/services/route-params';

import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { createSelectOptionFromArrayList } from '../../../employee/common/extract-helpers';
import { LoadSitesAction } from '../../../shared/actions/company.actions';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { mapSiteLookupTableToAeSelectItems } from '../../../shared/helpers/extract-helpers';
import { IFormBuilderVM } from '../../../shared/models/iform-builder-vm';
import * as fromRoot from '../../../shared/reducers';
import { FormBuilderService } from '../../../shared/services/form-builder.service';
import { ChecklistCopyForm } from '../../models/checklist-copy-form';
import { Checklist } from '../../models/checklist.model';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormControl } from '@angular/forms/forms';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';


@Component({
  selector: 'checklist-copy',
  templateUrl: './checklist-copy.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChecklistCopyComponent extends BaseComponent implements OnInit, OnDestroy {
  private _sitesList: Immutable.List<AeSelectItem<string>>;
  private _siteOptionsSubscription$: Subscription;
  private _checkListCopyForm: FormGroup;
  private _isFormSubmitted: boolean = false;
  private _checklistToCopy: Checklist;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _checkListCopyFormVM: IFormBuilderVM;
  private _formName: string;
  private _siteOptions$: BehaviorSubject<Immutable.List<AeSelectItem<string>>>;
  private _siteLocationVisibility: BehaviorSubject<boolean>;
  private _siteVisibility: BehaviorSubject<boolean>;

  @Input('checklistToCopy')
  get checklistToCopy(): Checklist {
    return this._checklistToCopy;
  }
  set checklistToCopy(val: Checklist) {
    this._checklistToCopy = val;
  }

  get checkListCopyFormVM() {
    return this._checkListCopyFormVM;
  }

  get lightClass() {
    return this._lightClass;
  }

  @Output('slideOutClose')
  private _slideOutClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output('copyChecklistSubmit')
  private _copyChecklistSubmit: EventEmitter<any> = new EventEmitter<any>();

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _fb: FormBuilderService
    , private _claims: ClaimsHelperService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef)
  }

  ngOnInit() {
    this._formName = 'copyChecklistForm';
    this._checkListCopyFormVM = new ChecklistCopyForm(this._formName);
    let fields = this._checkListCopyFormVM.init();
    let siteField = fields.find(f => f.field.name === 'Site');
    if (!isNullOrUndefined(siteField)) {
      this._siteOptions$ = siteField.context.getContextData().get('options');
      //Subscription to get Site Location Option Data, using existing effect
      this._siteOptionsSubscription$ = this._store.let(fromRoot.getSiteData).subscribe((res) => {
        if (!isNullOrUndefined(res)) {
          let siteList = createSelectOptionFromArrayList(res, "Id", "SiteNameAndPostcode");
          siteList.push(new AeSelectItem<string>('Select new affected site location', 'null', false));
          siteList = [new AeSelectItem<string>('All Sites', '00000000-0000-0000-0000-000000000000', false)].concat(siteList);
          this._sitesList = Immutable.List<AeSelectItem<string>>(siteList);
          this._siteOptions$.next(this._sitesList);
        } else {
          this._store.dispatch(new LoadSitesAction(false));
        }
      });
    }
    let siteLocationField = fields.find(f => f.field.name === 'SiteLocation');
    this._siteLocationVisibility = <BehaviorSubject<boolean>>siteLocationField.context.getContextData().get('propertyValue');
    this._siteVisibility = <BehaviorSubject<boolean>>siteField.context.getContextData().get('propertyValue');
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._siteOptionsSubscription$)) {
      this._siteOptionsSubscription$.unsubscribe();
    }
  }

  onSubmit(e) {
    this._isFormSubmitted = true;
    if (this._checkListCopyForm.valid) {
      this._copyChecklistSubmit.emit(this._checkListCopyForm.value);
    }
  }

  formButtonNames() {
    return { Submit: 'Copy' };
  }
  
  onCancel(e) {
    this._slideOutClose.emit(false);
  }

  onFormInit(fg: FormGroup) {
    this._checkListCopyForm = fg;
    if (this.checklistToCopy.IsExample && !this._routeParamsService.Cid) {
      this._siteVisibility.next(false);
    } else {
      this._siteVisibility.next(true);
    }
    if (!isNullOrUndefined(this._checkListCopyForm.get('Site'))) {
      this._checkListCopyForm.get('Site').valueChanges.subscribe((newVal) => {
        if (newVal === 'null') {
          this._siteLocationVisibility.next(true);
        }
        else {
          this._siteLocationVisibility.next(false);
        }
      });
      this._checkListCopyForm.get('Site').setValue('00000000-0000-0000-0000-000000000000');
    }
  }
}
