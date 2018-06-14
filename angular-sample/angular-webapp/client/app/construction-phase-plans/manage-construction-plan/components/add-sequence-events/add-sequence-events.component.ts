import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { FormBuilder, Validators, AbstractControl, FormControl, FormArray } from '@angular/forms';
import { CPPEvent } from './../../../models/construction-phase-plans';
import { FormGroup } from '@angular/forms';
import { IFormBuilderVM, IFormFieldWrapper } from './../../../../shared/models/iform-builder-vm';
import { isNullOrUndefined } from 'util';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/Rx';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';

@Component({
  selector: 'add-sequence-events',
  templateUrl: './add-sequence-events.component.html',
  styleUrls: ['./add-sequence-events.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddSequenceEventsComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields 
  private _addUpdateSequenceOfEventsFrmGrp: FormGroup;
  private _context: any;
  private _sequenceOfEventsModel: CPPEvent[] = [];
  private _formGroupArray: FormGroup[] = [];
  private _furtherSteps: Immutable.List<AeSelectItem<number>> = Immutable.List([new AeSelectItem<number>('1', 1), new AeSelectItem<number>('2', 2), new AeSelectItem<number>('3', 3), new AeSelectItem<number>('4', 4), new AeSelectItem<number>('5', 5)]);
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _action: string;
  private borderStyle: any[] = [];  

  // End of Private Fields

  // Public properties 
  @Input('context')
  set context(val: any) {
    this._context = val;
  }
  get context() {
    return this._context;
  }
  
  @Input('sequenceOfEventsModel')
  set sequenceOfEventsModel(val: CPPEvent[]) {
    this._sequenceOfEventsModel = Array.from(val);
    this._sequenceOfEventsModel = this._sequenceOfEventsModel.sort(function (a, b) { return a.Index - b.Index; });
    this._sequenceOfEventsModel = this._formatInput(this._sequenceOfEventsModel);
  }
  get sequenceOfEventsModel() {
    return this._sequenceOfEventsModel;
  }
  

  @Input('action')
  get action() {
    return this._action;
  }
  set action(value: string) {
    this._action = value;
  }
  get addUpdateSequenceOfEventsFrmGrp(): FormGroup {
    return this._addUpdateSequenceOfEventsFrmGrp;
  }
  get events(): AbstractControl[] {
    return (<FormArray>this._addUpdateSequenceOfEventsFrmGrp.controls['events']).controls;
  }
  get furtherSteps(): Immutable.List<AeSelectItem<number>> {
    return this._furtherSteps
  }
  // End of Public properties

  // Public Output bindings
  @Output('onAeSubmit') _onAeSubmit: EventEmitter<CPPEvent[]> = new EventEmitter<CPPEvent[]>();
  @Output('aeClose') _aeClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _fb: FormBuilder
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
  }
  // End of constructor

  // Private methods  

  private _extractModel(): CPPEvent[] {
    let formmValue = this._getRows();
    let newArray: CPPEvent[] = [];
    let validIndex: number = 0;
    this.borderStyle = [];
    for (let i = 0; i < formmValue.length; i++) {
      let formEvent = <FormGroup>formmValue.controls[i];
      let Id = formEvent.controls['Id'].value;
      let eventDetails = formEvent.controls['EventDetails'].value;
      let eventDate = formEvent.controls['KeyDates'].value;
      if (!StringHelper.isNullOrUndefinedOrEmpty(Id) && !StringHelper.isNullOrUndefinedOrEmpty(eventDetails) && !isNullOrUndefined(eventDate)) {
        let existingCppEvent: CPPEvent = this._sequenceOfEventsModel.find(obj => obj.Id == Id);
        existingCppEvent.StepDetail = eventDetails;
        existingCppEvent.Date = eventDate;
        newArray.push(existingCppEvent);
        validIndex++;
      }
      else if (StringHelper.isNullOrUndefinedOrEmpty(Id) && !StringHelper.isNullOrUndefinedOrEmpty(eventDetails) && !isNullOrUndefined(eventDate)) {
        let newCPPEvent = new CPPEvent();
        newCPPEvent.StepDetail = eventDetails;
        newCPPEvent.Date = eventDate;
        newCPPEvent.Index = validIndex;
        newArray.push(newCPPEvent);
        validIndex++;
      } else {
        if (StringHelper.isNullOrUndefinedOrEmpty(eventDetails) && !isNullOrUndefined(eventDate)) {
          this.borderStyle[validIndex] = { step: true };
        }
        else if (isNullOrUndefined(eventDate) && !StringHelper.isNullOrUndefinedOrEmpty(eventDetails)) {
          this.borderStyle[validIndex] = { date: true };
        }
        //Here validation should fire against a field only when there is at least no one sequence of event details && one of the other value from event details or event date is available
        // else if (!StringHelper.isNullOrUndefinedOrEmpty(Id) && StringHelper.isNullOrUndefinedOrEmpty(eventDetails) && isNullOrUndefined(eventDate)) {
        //   this.borderStyle[validIndex] = { step: true, date: true };
        // }
        validIndex++;
      }
    }
    return newArray;
  }

  setErrorMSg(index, key) {
    if (!isNullOrUndefined(this.borderStyle[index])) {
      if (this.borderStyle[index].step == true && key == 'step') {
        return true;
      } else if (this.borderStyle[index].date == true && key == 'date') {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  private _getRows(): FormArray {
    return this._addUpdateSequenceOfEventsFrmGrp.get('events') as FormArray;
  }

  private _formatInput(model: CPPEvent[]): CPPEvent[] {
    //by default returning 5 items
    if (isNullOrUndefined(model)) {
      model = [];
    }
    if (model.length < 5) {
      let missedItems = 5 - model.length;
      for (let i = 0; i < missedItems; i++) {
        model.push(new CPPEvent());
      }
    }
    return model;
  }
  private _initForm() {
    let index: number = 0;
    let controls = [];
    this._sequenceOfEventsModel.forEach(event => {
      let ctrlName = index.toString();
      let eventDetailsCtrl: FormGroup = this._fb.group({
        Id: [{ value: event.Id, disabled: false }, null]
        , EventDetails: [{ value: event.StepDetail, disabled: false }, [Validators.required]]
        , KeyDates: [{ value: (event.Date ? new Date(event.Date) : null), disabled: false }, [Validators.required]]
      });
      //this._addUpdateSequenceOfEventsFrmGrp = new FormGroup();
      controls.push(eventDetailsCtrl);
      this._formGroupArray.push(eventDetailsCtrl);
      index++;
    });

    this._addUpdateSequenceOfEventsFrmGrp = this._fb.group(
      { events: new FormArray(controls) }
    );
  }
  // End of private methods

  // Public methods

  get lightClass() {
    return this._lightClass;
  }
  onAddUpdateFormClosed($event) {
    this._aeClose.emit(true);
  }
  onAddUpdateFormSubmit($event) {
    let sequenceOfEventsModel: CPPEvent[] = this._extractModel();
    if (this.borderStyle.length == 0) {
      this._onAeSubmit.emit(sequenceOfEventsModel);
    }
  }
  onAddSteps($event) {
    let stepsToAdd: number = $event.SelectedValue;
    for (let i = 0; i < stepsToAdd; i++) {
      let eventDetailsCtrl: FormGroup = this._fb.group({
        Id: [{ value: '', disabled: false }, null]
        , EventDetails: [{ value: '', disabled: false }, [Validators.required]]
        , KeyDates: [{ value: null, disabled: false }, [Validators.required]]
      });
      this._getRows().push(eventDetailsCtrl);
    }
  }
  getPageHeader() {
    return this._action == 'add' ? "CPP_ADD.ADD_SEQUENCE_OF_EVENTS_PLUS" : "CPP_ADD.UPDATE_SEQUENCE_OF_EVENTS";
  }
  formButtonNames() {
    return this._action == 'add' ? 'Add' : 'Update';
  }
  ngOnInit() {
    this._initForm();
  }
  ngOnDestroy() {

  }
  // End of public methods

}
