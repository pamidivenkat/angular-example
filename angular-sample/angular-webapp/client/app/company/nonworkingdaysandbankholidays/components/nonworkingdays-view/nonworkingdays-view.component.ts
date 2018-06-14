import { BehaviorSubject } from 'rxjs/Rx';
import { AeListItem } from './../../../../atlas-elements/common/models/ae-list-item';
import { DateTimeHelper } from './../../../../shared/helpers/datetime-helper';
import { DataTableOptions } from './../../../../atlas-elements/common/models/ae-datatable-options';
import { PublicHoliday } from './../../../../holiday-absence/models/holiday-absence.model';
import { Observable } from 'rxjs/Rx';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService, LocaleDatePipe } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { NonworkingdaysOperationmode } from './../../models/nonworkingdays-operationmode-enum';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { NonWorkingdaysModel } from './../../models/nonworkingdays-model';
import { getAssignedToItems } from './../../common/extract-helpers';


@Component({
  selector: 'nonworkingdays-view',
  templateUrl: './nonworkingdays-view.component.html',
  styleUrls: ['./nonworkingdays-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class NonworkingdaysViewComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _nonWorkingDaysModel: NonWorkingdaysModel;
  // End of Private Fields

  // Public properties
  @Input('nonWorkingdaysModel')
  set NonWorkingdaysModel(val: NonWorkingdaysModel) {
    this._nonWorkingDaysModel = val;
  }
  get NonWorkingdaysModel() {
    return this._nonWorkingDaysModel;
  }
  
  // End of Public properties

  // Public Output bindings
  @Output()
  aeOnClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService
    , _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , private _localeDatePipe: LocaleDatePipe
  ) {
    super(_localeService, _translationService, _changeDetector);

  }
  // End of constructor

  // Private methods
  onViewClose() {
    this.aeOnClose.emit(true);
  }
  // End of private methods

  // Public methods
  ngOnInIt() {

  }
  ngOnDestroy() {

  }
  // End of public methods
}
