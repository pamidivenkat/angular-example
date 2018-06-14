import { AeLoaderType } from '../../../../atlas-elements/common/ae-loader-type.enum';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { EmployeeFilterModel } from '../../models/employee-filter.model';
import { Subscription } from 'rxjs/Subscription';
import { isNullOrUndefined } from 'util';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { EmployeeMetadata } from '../../models/employee-metadata.model';
import { StringHelper } from '../../../../shared/helpers/string-helper';
import { AeDragVm } from '../../../../atlas-elements/ae-drag-drop/common/models/ae-drag-vm';
import { AeOrgChartNodeType } from '../../../../atlas-elements/common/models/ae-org-chart-node-model';

@Component({
  selector: 'employee-filter',
  templateUrl: './employee-filter.component.html',
  styleUrls: ['./employee-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeFilterComponent extends BaseComponent implements OnInit, OnDestroy {
  // private fields start
  private _employeeFilterForm: FormGroup;
  private _employeeFilterVM: EmployeeFilterModel;
  private _sites: Immutable.List<AeSelectItem<string>>;
  private _departments: Immutable.List<AeSelectItem<string>> = Immutable.List([]);
  private _departmentEmployees: Map<string, Array<EmployeeMetadata>>;
  private _employees: Array<EmployeeMetadata> = [];
  private _loaderType: AeLoaderType = AeLoaderType.Bars;
  private _loading: boolean = true;
  private _nameChangeSubscription: Subscription;
  private _siteDeptChangeSubscription: Subscription;
  private _eFFSubscription: Subscription;
  // end of private fields

  // public properties
  @Input('sites')
  get sites() {
    return this._sites;
  }
  set sites(val: Immutable.List<AeSelectItem<string>>) {
    this._sites = val;
  }
  @Input('departments')
  get departments() {
    return this._departments;
  }
  set departments(val: Immutable.List<AeSelectItem<string>>) {
    if (!isNullOrUndefined(val)) {
      this._departments = this._getDefaultOptions().concat(val).toList();
      this._changeDetector.markForCheck();
    }else{
      this._fillDefaultOptions();
    }
  }
  @Input('loading')
  get loading() {
    return this._loading;
  }
  set loading(val: boolean) {
    this._loading = val;
  }
  @Input('departmentEmployees')
  get departmentEmployees() {
    return this._departmentEmployees;
  }
  set departmentEmployees(val: Map<string, Array<EmployeeMetadata>>) {
    this._departmentEmployees = val;

    if (!isNullOrUndefined(val)) {
      this._filterEmployees(); 
      this._loading = false;
    }
  }

  get employeeFilterForm() {
    return this._employeeFilterForm;
  }

  get employees() {
    return this._employees;
  }

  get loaderType() {
    return this._loaderType;
  }

  get hasLoading() {
    return this._loading;
  }
  // end of public properties

  // Constructor
  constructor(protected _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService
    , _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
    , private _fb: FormBuilder
  ) {
    super(_localeService, _translationService, _changeDetector);
  }
  // End of constructor

  // private methods start
  private _initForm() {
    this._employeeFilterVM = new EmployeeFilterModel();

    this._employeeFilterForm = this._fb.group({
      Name: [{ value: this._employeeFilterVM.Name, disabled: false }],
      Site: [{ value: this._employeeFilterVM.Site, disabled: false }],
      Department: [{ value: this._employeeFilterVM.Department, disabled: false }]
    });

    for (let name in this._employeeFilterForm.controls) {
      if (this._employeeFilterForm.controls.hasOwnProperty(name)) {
        let control = this._employeeFilterForm.controls[name];
        if (name === 'Name') {
          this._nameChangeSubscription = control.valueChanges.debounceTime(1000).subscribe((empName) => {
            this._employeeFilterVM[name] = empName;
            this._filterEmployees();
          });
        } else {
          this._siteDeptChangeSubscription = control.valueChanges.subscribe(v => {
            this._employeeFilterVM[name] = v;
            this._filterEmployees();
          });
        }
      }
    }
  }

  private _filterEmployees() {
    let employees: Array<EmployeeMetadata> = [];
    if (!isNullOrUndefined(this._departmentEmployees) && !isNullOrUndefined(this._employeeFilterVM)) {
      if (StringHelper.isNullOrUndefinedOrEmpty(this._employeeFilterVM.Department) || this._employeeFilterVM.Department.toLowerCase() === 'all') {
        this._departmentEmployees.forEach((value, keyName) => {
          if (keyName.toLowerCase() !== 'none') {
            employees = employees.concat((this._departmentEmployees.get(keyName) || []));
          }
        });
      } else {
        employees = this._departmentEmployees.get(this._employeeFilterVM.Department) || [];
      }

      employees = employees.filter((employee) => {
        return employee.Name.toLowerCase().indexOf(this._employeeFilterVM.Name.toLowerCase()) !== -1;
      });

      employees = employees.filter((employee) => {
        return StringHelper.isNullOrUndefinedOrEmpty(this._employeeFilterVM.Site)
          ? true
          : !StringHelper.isNullOrUndefinedOrEmpty(employee.SiteId) &&
          employee.SiteId.toLowerCase() === this._employeeFilterVM.Site.toLowerCase();
      });
      this._loading = false;
      this._changeDetector.markForCheck();
      this._employees =  employees.sort((a, b) => a.Name.localeCompare(b.Name));
    } else {
      this.formDeclaration();
    }
  }

  formDeclaration() {
    this._initForm();
    this._filterEmployees();
    this._changeDetector.markForCheck();
  }


  hasEmployees() {
    return !isNullOrUndefined(this._employees) && this._employees.length > 0;
  }

  private _fillDefaultOptions() {
    this._departments = this._getDefaultOptions();
  }

  private _getDefaultOptions() {
    return Immutable.List([
      new AeSelectItem<string>('No department', 'none', false),
      new AeSelectItem<string>('All departments', 'all', false)
    ]);
  }

  getDraggableVm(employee): AeDragVm<any> {
    return {
      dragEffect: null,
      identifier: AeOrgChartNodeType[AeOrgChartNodeType.Employee],
      canChildrenDraggableIndependently: false,
      canDragHandleContainer: true,
      dragHandle: null,
      canDrag: (context) => true,
      model: {
        SourceId: employee.Id,
        SourceType: AeOrgChartNodeType[AeOrgChartNodeType.Employee]
      }
    };
  }

  // end of private methods start

  // public methods start
  ngOnInit() {
   // this._fillDefaultOptions();
    this._initForm();
    this._eFFSubscription = this._employeeFilterForm.valueChanges.takeUntil(this._destructor$).subscribe(data => {
      if (!StringHelper.isNullOrUndefinedOrEmpty(data.Name)){
        this._loading = true;
      }      
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    if (!isNullOrUndefined(this._nameChangeSubscription)) {
      this._nameChangeSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._siteDeptChangeSubscription)) {
      this._siteDeptChangeSubscription.unsubscribe();
    }
  }
  // end of public methods

}
