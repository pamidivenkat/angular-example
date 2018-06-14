import { DatePipe } from '@angular/common';
import { NonWorkingdaysNotesModel } from './../../models/nonworkingdays-model';
import { AeListItem } from './../../../../atlas-elements/common/models/ae-list-item';
import { Subscription } from 'rxjs/Subscription';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService, LocaleDatePipe } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { NonworkingdaysOperationmode } from './../../models/nonworkingdays-operationmode-enum';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';

@Component({
  selector: 'standard-nonworkingdays-notes',
  templateUrl: './standard-nonworkingdays-notes.component.html',
  styleUrls: ['./standard-nonworkingdays-notes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandardNonworkingdaysNotesComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _notes: NonWorkingdaysNotesModel[];
  private _notesList: Immutable.List<AeListItem>;
  private _defaultLocale: string;
  // End of Private Fields

  // Public properties
  @Input('notes')
  set Notes(val: NonWorkingdaysNotesModel[]) {
    this._notes = val;
    if (val) {
      this._setNotesList();
    }
  }
  get Notes() {
    return this._notes;
  }
  

  get notesList(){
    return this._notesList;
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
  notesExists() {
    return this._notes && this._notes.length > 0;
  }
  private _setNotesList() {
    this._notesList = Immutable.List<AeListItem>(this._notes.map((keyValuePair) => {
      let aeSelectItem = new AeListItem();
      aeSelectItem.Text = keyValuePair.Notes + ' on ' + this._localeDatePipe.transform(keyValuePair.CreatedOn, this._defaultLocale, 'dd/MM/yyyy');
      return aeSelectItem;
    }));
  }
  slideClose($event) {
    this.aeOnClose.emit(true);
  }
  // End of private methods

  // Public methods
  ngOnInIt() {
    this._defaultLocale = this._localeService.getDefaultLocale();
    this._localeService.defaultLocaleChanged.subscribe(
      (locale) => { this._defaultLocale = locale }
    );
  }

  ngOnDestroy(): void {

  }
  // End of public methods

}
