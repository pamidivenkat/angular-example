import { Periodicity } from '../../common/periodicity.enum';
import { getAeSelectItemsFromEnum } from '../../../employee/common/extract-helpers';
import { UserService } from '../../../shared/services/user-services';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { LoadSitesAction } from '../../../shared/actions/company.actions';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { AssignmentForm } from '../../models/assignment.form';
import { FormBuilderService } from '../../../shared/services/form-builder.service';
import { IFormBuilderVM, IFormFieldWrapper } from '../../../shared/models/iform-builder-vm';
import { CheckListAssignment } from '../../models/checklist-assignment.model';
import { FormGroup } from '@angular/forms';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, EventEmitter, Output, Input, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import * as fromRoot from '../../../shared/reducers';
import * as Immutable from 'immutable';
import * as checklistActions from '../../actions/checklist.actions';

@Component({
  selector: 'assignment'
  , templateUrl: './assignment.component.html'
  , styleUrls: ['./assignment.component.scss']
  , changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignmentComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _formName: string;
  private _assignmentForm: FormGroup;
  private _assignment: CheckListAssignment;
  private _assignmentFormVM: IFormBuilderVM;
  private _fields: Array<IFormFieldWrapper<any>>;
  private _siteOptions$: BehaviorSubject<Immutable.List<AeSelectItem<string>>>;
  private _users$: Observable<AeSelectItem<string>[]>;
  private _filteredUsers: AeSelectItem<string>[] = [];
  private _frequencyOptions: BehaviorSubject<Immutable.List<AeSelectItem<number>>>;
  private _frequencyFieldVisibilty: BehaviorSubject<boolean>;
  private _siteLocationVisibilty: BehaviorSubject<boolean>;
  private _defaultSiteOption: Immutable.List<AeSelectItem<string>>;
  private _otherSiteOption: Immutable.List<AeSelectItem<string>>;
  private _checklistId: string;
  private _action: string;
  private _searchEventSubscription: Subscription;
  private _siteDataSubscription: Subscription;
  // End of Private Fields

  // Public properties
  @Input('users')
  set users(val: Observable<AeSelectItem<string>[]>) {
    this._users$ = val;
  }
  get users() {
    return this._users$;
  }
 

  @Input('checklistId')
  get checklistId() {
    return this._checklistId;
  }
  set checklistId(val: string) {
    this._checklistId = val;
  }

  @Input('selectedAssignment')
  set selectedAssignment(val: CheckListAssignment) {
    this._assignment = val;
  }
  get selectedAssignment() {
    return this._assignment;
  }
 

  @Input('action')
  get action(): string {
    return this._action;
  }
  set action(val: string) {
    this._action = val;
  }

  get assignmentFormVM() {
    return this._assignmentFormVM;
  }
  // End of Public properties

  // Public Output bindings
  @Output('onCancel') _onAssignmentFormCancel: EventEmitter<string>;
  @Output('onSubmit') _onAssignmentFormSubmit: EventEmitter<string>;
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _formBuilder: FormBuilderService
    , private _store: Store<fromRoot.State>
    , private _userService: UserService) {
    super(_localeService, _translationService, _cdRef);
    this._onAssignmentFormCancel = new EventEmitter<string>();
    this._onAssignmentFormSubmit = new EventEmitter<string>();
  }
  // End of constructor

  // Public methods
  onFormInit(fg: FormGroup) {
    this._assignmentForm = fg;
    this._assignmentForm.get('IsRecurring').valueChanges.subscribe((value) => {
      this._frequencyFieldVisibilty.next(value);
    });
    this._assignmentForm.get('Site').valueChanges.subscribe((value) => {
      this._siteLocationVisibilty.next(value === 'Other' ? true : false);
    });

    if (this._action !== 'add') {
      this._assignmentForm.get('AssignedTo').setValue([{ Text: this._assignment.AssignedTo.FullName, Value: this._assignment.AssignedTo.Id }]);

      if (this._assignmentForm.get('SiteLocation')) {
        this._assignmentForm.get('SiteLocation').setValue(this._assignment.SiteLocation);
      }

      if (!isNullOrUndefined(this._assignment.SiteId)) {
        this._assignmentForm.get('Site').setValue(this._assignment.SiteId);
      } else {
        this._assignmentForm.get('Site').setValue('Other');
      }

      this._assignmentForm.get('IsRecurring').setValue(this._assignment.IsReccuring);
      this._assignmentForm.get('Frequency').setValue(this._assignment.Periodicity);
      this._assignmentForm.get('ScheduledDate').setValue(new Date(this._assignment.ScheduledDate));
    }
  }

  onCancel($event) {
    this._onAssignmentFormCancel.emit('cancel');
  }

  onSubmit($event) {
    if (this._assignmentForm.valid) {
      this._onAssignmentFormSubmit.emit('submit');
      let assignedTo = (this._assignmentForm.get('AssignedTo').value)[0];
      if (this._action === 'add') {
        this._assignment.AssignedToId = assignedTo.Value ? assignedTo.Value : assignedTo;
      } else {
        this._assignment.AssignedToId = assignedTo.Value ? assignedTo.Value : assignedTo;
      }

      this._assignment.CheckListId = this._checklistId;
      this._assignment.DueDate = this._assignmentForm.get('ScheduledDate').value;
      this._assignment.NextDueDate = this._assignmentForm.get('ScheduledDate').value;
      this._assignment.ScheduledDate = this._assignmentForm.get('ScheduledDate').value;
      if (this._assignmentForm.get('Site').value !== 'Other') {
        this._assignment.SiteId = this._assignmentForm.get('Site').value;
      } else {
        this._assignment.SiteId = null;
        this._assignment.Site = null;
      }

      this._assignment.SiteLocation = this._assignmentForm.get('SiteLocation') ? this._assignmentForm.get('SiteLocation').value : '';

      this._assignment.IsReccuring = this._assignmentForm.get('IsRecurring').value;
      if (this._assignment.IsReccuring) {
        this._assignment.Periodicity = this._assignmentForm.get('Frequency').value;
      } else {
        this._assignment.Periodicity = null;
      }
      if (this._action === 'add') {
        this._store.dispatch(new checklistActions.AddAssignmentAction(this._assignment));
      } else {
        this._store.dispatch(new checklistActions.UpdateAssignmentAction(this._assignment));
      }

    }
  }

  formTitle(): string {
    return (this._action === 'add' ? 'Add' : 'Update') + ' checklist assignment';
  }

  formButtonLabels() {
    let lables = { Submit: this._action === 'add' ? 'Add' : 'Update' };
    return lables;
  }



  ngOnInit() {
    super.ngOnInit();
    if (isNullOrUndefined(this._assignment) || this._action === 'add') {
      this._assignment = new CheckListAssignment();
    }
    this._formName = 'assignmentForm';
    this._assignmentFormVM = new AssignmentForm(this._formName);
    this._fields = this._assignmentFormVM.init()

    let siteField = this._fields.find(field => field.field.name === 'Site')
    if (!isNullOrUndefined(siteField)) {
      this._siteOptions$ = <BehaviorSubject<Immutable.List<AeSelectItem<string>>>>siteField.context.getContextData().get('options');
      let siteData = this._store.let(fromRoot.getSiteWithOtherOptions);
      this._siteDataSubscription = siteData.takeWhile((data) => isNullOrUndefined(data)).subscribe((data) => {
        this._store.dispatch(new LoadSitesAction(false));
      });

      siteData.skipWhile((data) => isNullOrUndefined(data)).subscribe(this._siteOptions$);
      siteData.skipWhile((data) => isNullOrUndefined(data)).subscribe((val) => {
        if (this._action !== 'add' && !isNullOrUndefined(this._assignmentForm))
          if (!isNullOrUndefined(this._assignment.SiteId)) {
            this._assignmentForm.get('Site').setValue(this._assignment.SiteId);
          } else {
            this._assignmentForm.get('Site').setValue('Other');
          }
      });

    }

    let userField = this._fields.find(field => field.field.name === 'AssignedTo');
    if (!isNullOrUndefined(userField)) {
      this._users$ = siteField.context.getContextData().get('options');
      this._searchEventSubscription = (<EventEmitter<any>>userField.context.getContextData().get('searchEvent')).subscribe((user) => {
        this._userService.getFilteredUserData(user.query).first().subscribe((data) => {
          (<BehaviorSubject<AeSelectItem<string>[]>>userField.context.getContextData().get('items')).next(data);
          this._filteredUsers = data;
        });
      });

    }

    let frequendyField = this._fields.find(field => field.field.name === 'Frequency');
    this._frequencyFieldVisibilty = <BehaviorSubject<boolean>>frequendyField.context.getContextData().get('propertyValue');
    if (!isNullOrUndefined(frequendyField)) {
      this._frequencyOptions = frequendyField.context.getContextData().get('options');
      this._frequencyOptions.next(getAeSelectItemsFromEnum(Periodicity));
    }

    let siteLocationField = this._fields.find(field => field.field.name === 'SiteLocation');
    this._siteLocationVisibilty = <BehaviorSubject<boolean>>siteLocationField.context.getContextData().get('propertyValue');
  }

  OnDestroy() {
    this._searchEventSubscription.unsubscribe();
    this._siteDataSubscription.unsubscribe();
  }
  // End of public methods
}
