import { AeLoaderType } from '../../../../atlas-elements/common/ae-loader-type.enum';
import {
  Component
  , OnInit
  , ChangeDetectionStrategy
  , OnDestroy
  , ChangeDetectorRef
  , Input
  , ViewEncapsulation,
  ElementRef,
  Renderer,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { AeOrgChartNodeModel, AeOrgChartNodeType } from '../../../../atlas-elements/common/models/ae-org-chart-node-model';
import { DepartmentModel } from '../../models/department.model';
import { EmployeeMetadata } from '../../models/employee-metadata.model';
import { isNullOrUndefined } from 'util';
import { DepartmentType } from '../../models/department-type.enum';
import { OperationModes } from '../../../../holiday-absence/models/holiday-absence.model';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { StringHelper } from '../../../../shared/helpers/string-helper';
import {
  AddCompanyDepartmentAction
  , RemoveCompanyDepartmentAction
  , UpdateCompanyDepartmentAction,
  ClearCurrentCompanyDepartmentAction,
  AssignEmployeeToDepartmentAction
} from '../../actions/manage-departments.actions';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';
import { ManageDepartmentsService } from '../../services/manage-departments.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AeOrgChartComponent } from '../../../../atlas-elements/ae-org-chart/ae-org-chart.component';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';

@Component({
  selector: 'company-org-structure',
  templateUrl: './company-org-structure.component.html',
  styleUrls: ['./company-org-structure.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CompanyOrgStructureComponent extends BaseComponent implements OnInit, OnDestroy {
  // private field declarations start
  private _generatePDFSubscription: Subscription;
  private _printChartSubscription: Subscription;
  private _departments: Array<DepartmentModel>;
  private _employees: Array<EmployeeMetadata>;
  private _context: AeOrgChartNodeModel<{ Id: string, Title: string }>;
  private _selectedDeptTeam: DepartmentModel;
  private _showDeleteConfirmDialog: boolean = false;
  private _showManageDeptSlideOut: boolean = false;
  private _operationMode: OperationModes;
  private _managersList: Immutable.List<AeSelectItem<string>> = Immutable.List([]);
  private _orgChartFullView: boolean = false;
  private _iconName: string = 'icon-expand';
  private _iconTitle: string;
  private _employeeId: string = '';
  private _initialLoadComplete: boolean = false;
  private _loaderType: AeLoaderType = AeLoaderType.Bars;
  private _loading: boolean = true;
  private _refreshTrigger: boolean = null;
  private _addSubject: BehaviorSubject<any> = new BehaviorSubject(null);
  private _updateSubject: BehaviorSubject<any> = new BehaviorSubject(null);
  private _removeSubject: BehaviorSubject<any> = new BehaviorSubject(null);
  private _currentState: boolean = true;
  private _showChildren: Subject<boolean> = new Subject<boolean>();
  private _toggleIcon: string = 'icon-expand-up';
  private _toggleText: string = 'COLLAPSE_MODE';
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _addClickSubscription: Subscription;
  private _updateClickSubscription: Subscription;
  private _removeClickSubscription: Subscription;
  private _saveSubscription: Subscription;
  private _companyDepartmentsSubscription: Subscription;
  private _companyEmployeesSubscription: Subscription;
  // end of private fields

  // public properties start
  get toggleIcon() {
    return this._toggleIcon;
  }

  get lightClass() {
    return this._lightClass;
  }

  get toggleText() {
    return this._toggleText;
  }

  get context() {
    return this._context;
  }

  get showChildren() {
    return this._showChildren;
  }

  get loaderType() {
    return this._loaderType;
  }

  get loading() {
    return this._loading;
  }

  get showDeleteConfirmDialog() {
    return this._showDeleteConfirmDialog;
  }

  get showManageDeptSlideOut() {
    return this._showManageDeptSlideOut;
  }

  get operationMode() {
    return this._operationMode;
  }

  get selectedDeptTeam() {
    return this._selectedDeptTeam;
  }

  get managersList() {
    return this._managersList;
  }

  get selectedDeptTeamName() {
    return this._selectedDeptTeam.Name;
  }
  // end of public properties

  // View Child 
  @ViewChild('orgChart')
  _orgChart: AeOrgChartComponent<any>
  // End of View Child

  // output bindings start
  @Output()
  onEmployeeSelect: EventEmitter<string> = new EventEmitter<string>();
  // end of output bindings

  // Constructor
  constructor(protected _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService
    , _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
    , private _router: Router
    , private _manageDepartmentsService: ManageDepartmentsService
    , private _elemRef: ElementRef
    , private _renderer: Renderer
  ) {
    super(_localeService, _translationService, _changeDetector);
    this._selectedDeptTeam = new DepartmentModel();
  }
  // End of constructor

  // private methods start
  private _initOrgChart() {
    let company = this._departments.filter(c => c.Type === AeOrgChartNodeType.Company)[0];

    this._context = new AeOrgChartNodeModel<{ Id: string, Title: string }>();
    this._context.DetailsCount = this._employees.length;
    let mappedEmp = this._employees.map(c => {
      return {
        Id: c.Id,
        Title: c.Name
      };
    }).sort((a, b) => a.Title.localeCompare(b.Title));
    this._context.Details = Immutable.List(mappedEmp);
    this._context.BodyContext = { Id: '', Value: '', Icon: 'icon-building', Title: DepartmentType[DepartmentType.Company] };
    this._context.HeaderText = company.Name;
    this._context.Id = company.Id;
    this._context.NodeType = AeOrgChartNodeType.Company;
    this._context.CssClass = '';
    let actions = [{ Title: 'Add', IconName: 'icon-plus', CssClass: 'add', command: this._addSubject }];
    this._context.Actions = Immutable.List(actions);
    this._context.Effects = {
      canDrag: () => false,
      canDrop: () => false
    };
    this._context.Children = Immutable.List(this._createChildNodes(this._context.Id));
  }

  private _createChildNodes(parentId: string) {
    let children = [];
    let depts = this._departments.filter(d =>
      !isNullOrUndefined(d.ParentId) &&
      d.ParentId.toLowerCase() === parentId.toLowerCase());

    if (!isNullOrUndefined(depts) && depts.length > 0) {
      depts.forEach((dept) => {
        let child = new AeOrgChartNodeModel<{ Id: string, Title: string }>();
        let deptEmployees = this._employees.filter(e => !isNullOrUndefined(e.DepartmentId) &&
          e.DepartmentId.toLowerCase() === dept.Id).map(c => {
            return {
              Id: c.Id,
              Title: c.Name
            };
          }).sort((a, b) => a.Title.localeCompare(b.Title));
        if (!isNullOrUndefined(deptEmployees) && deptEmployees.length > 0) {
          child.DetailsCount = deptEmployees.length;
        } else {
          child.DetailsCount = 0;
        }
        child.Details = Immutable.List(deptEmployees);
        let iconName = '';
        if (dept.Type === AeOrgChartNodeType.Department) {
          iconName = 'icon-org-chart';
          let actions = [{ Title: 'Add', IconName: 'icon-plus', CssClass: 'add', command: this._addSubject },
          { Title: 'Update', IconName: 'icon-cogs', CssClass: 'update', command: this._updateSubject },
          { Title: 'Remove', IconName: 'icon-cross', CssClass: 'remove', command: this._removeSubject }];
          child.Actions = Immutable.List(actions);
        } else if (dept.Type === AeOrgChartNodeType.Team) {
          iconName = 'icon-people';
          let actions = [{ Title: 'Update', IconName: 'icon-cogs', CssClass: 'update', command: this._updateSubject },
          { Title: 'Remove', IconName: 'icon-cross', CssClass: 'remove', command: this._removeSubject }];
          child.Actions = Immutable.List(actions);
        }

        let managerName = '';
        let managerId = '';
        let managerEmployee = this._employees
          .filter(e => !isNullOrUndefined(e.Id) &&
            !isNullOrUndefined(dept.ManagerId) &&
            e.Id.toLowerCase() === dept.ManagerId.toLowerCase());
        if (!isNullOrUndefined(managerEmployee) &&
          managerEmployee.length > 0) {
          managerName = managerEmployee[0].Name;
          managerId = managerEmployee[0].Id;
        }

        child.BodyContext = { Id: managerId, Value: managerName, Icon: iconName, Title: DepartmentType[dept.Type] };
        child.HeaderText = dept.Name;
        child.Id = dept.Id;
        child.NodeType = dept.Type;
        if (dept.Type === AeOrgChartNodeType.Department) {
          child.CssClass = 'teal';
        } else if (dept.Type === AeOrgChartNodeType.Team) {
          child.CssClass = 'yellow';
        } else {
          child.CssClass = '';
        }
        child.Effects = {
          canDrag: (ctx) => true,
          canDrop: (ctx) => this._canDropDeptTeam(ctx, child.Id, AeOrgChartNodeType[child.NodeType])
        };

        child.Children = Immutable.List(this._createChildNodes(dept.Id));
        children.push(child);
      });
    }
    return children;
  }

  private _doesTargetisinSourceChildren(sourceId: string, targetId: string) {
    let status: boolean = false;
    let sourceDept = this._departments.filter((dept) => dept.Id.toLowerCase() === sourceId)[0];
    if (!isNullOrUndefined(sourceDept)) {
      sourceDept.Departments = this._departments.filter(d => d.ParentId == sourceDept.Id);

      if (sourceDept.Departments.length > 0) {
        for (let i = 0; i < sourceDept.Departments.length; i++) {
          let d = sourceDept.Departments[i];
          if (d.Id == targetId) {
            status = true;
            break;
          } else {
            status = this._doesTargetisinSourceChildren(d.Id, targetId);
          }
        }
      }
    }
    return status;
  }

  private _canDropDeptTeam(ctx, targetId: string, targetType: string) {
    if (!isNullOrUndefined(ctx) &&
      !isNullOrUndefined(ctx.model) &&
      !StringHelper.isNullOrUndefinedOrEmpty(ctx.model.SourceId) &&
      !StringHelper.isNullOrUndefinedOrEmpty(targetId)) {
      if (ctx.model.SourceType === AeOrgChartNodeType[AeOrgChartNodeType.Employee]) {
        return true;
      }

      let sourceId = ctx.model.SourceId.toLowerCase();
      targetId = targetId.toLowerCase();

      let sourceDept = this._departments.filter((dept) => dept.Id.toLowerCase() === sourceId)[0];
      let targetDept = this._departments.filter((dept) => dept.Id.toLowerCase() === targetId)[0];

      if (!isNullOrUndefined(sourceDept) &&
        !isNullOrUndefined(targetDept) &&
        targetDept.Id !== sourceDept.ParentId &&
        sourceDept.Id !== targetDept.ParentId &&
        targetDept.Type !== AeOrgChartNodeType.Team &&
        !this._doesTargetisinSourceChildren(sourceId, targetId)) {
        return true;
      }
    }
    return false;
  }

  private _changeDeptTeamPosition(node: AeOrgChartNodeModel<{ Id: string, Title: string }>
    , department: DepartmentModel) {

  }

  private _addTeamOrDept(e) {
    if (!isNullOrUndefined(e) &&
      !StringHelper.isNullOrUndefinedOrEmpty(e.Id)) {
      let deptTeamId = (<string>e.Id).toLowerCase();
      let parentDepts = this._departments.filter(c => !isNullOrUndefined(c.Id) &&
        c.Id.toLowerCase() === deptTeamId).map(c => c.Name);
      this._operationMode = OperationModes.Add;
      this._managersList = Immutable.List(this._employees
        .filter(c => c.IsManager === true)
        .sort((a, b) => a.Name.localeCompare(b.Name))
        .map(c => new AeSelectItem<string>(c.Name, c.Id, false)));
      let model = new DepartmentModel();
      if (!isNullOrUndefined(parentDepts) &&
        parentDepts.length > 0) {
        model.ParentDepartmentName = parentDepts[0];
        model.ParentId = deptTeamId;
      }
      this._selectedDeptTeam = model;
      this._showManageDeptSlideOut = true;
    }
  }

  private _updateTeamOrDept(e) {
    if (!isNullOrUndefined(e) &&
      !StringHelper.isNullOrUndefinedOrEmpty(e.Id)) {
      this._operationMode = OperationModes.Update;
      let deptId = (<string>e.Id).toLowerCase();
      let model = Object.assign({}, this._departments.filter(d => d.Id.toLowerCase() === deptId)[0]);
      let parentDepts = this._departments.filter(c => !isNullOrUndefined(c.Id) &&
        c.Id.toLowerCase() === model.ParentId.toLowerCase()).map(c => c.Name);
      if (!isNullOrUndefined(parentDepts) &&
        parentDepts.length > 0) {
        model.ParentDepartmentName = parentDepts[0];
      }
      this._managersList = Immutable.List(this._employees
        .filter(c => c.IsManager === true)
        .sort((a, b) => a.Name.localeCompare(b.Name))
        .map(c => new AeSelectItem<string>(c.Name, c.Id, false)));
      this._selectedDeptTeam = model;
      this._showManageDeptSlideOut = true;
    }
  }

  private _removeTeamOrDept(e) {
    this._selectedDeptTeam = this._departments.filter(c => c.Id == e.Id)[0];
    this._showDeleteConfirmDialog = true;
  }

  getManageDepTeamSlideoutState() {
    return this._showManageDeptSlideOut ? 'expanded' : 'collapsed';
  }

  saveDeptOrTeam(deptTeam: DepartmentModel) {
    this._showManageDeptSlideOut = false;
    if (this._operationMode == OperationModes.Add) {
      this._store.dispatch(new AddCompanyDepartmentAction(deptTeam));
    } else {
      this._store.dispatch(new UpdateCompanyDepartmentAction(deptTeam));
    }
  }

  private _assignEmpToDept($event) {
    this._store.dispatch(new AssignEmployeeToDepartmentAction($event));
  }

  closeManageDeptForm(e) {
    this._showManageDeptSlideOut = false;
  }

  private _prepareNodeFromDepartment(department: DepartmentModel) {
    let child = new AeOrgChartNodeModel<{ Id: string, Title: string }>();
    let deptEmployees = this._employees.filter(e => !isNullOrUndefined(e.DepartmentId) &&
      e.DepartmentId.toLowerCase() === department.Id).map(c => {
        return {
          Id: c.Id,
          Title: c.Name
        };
      }).sort((a, b) => a.Title.localeCompare(b.Title));
    if (!isNullOrUndefined(deptEmployees) && deptEmployees.length > 0) {
      child.DetailsCount = deptEmployees.length;
    } else {
      child.DetailsCount = 0;
    }
    child.Details = Immutable.List(deptEmployees);
    let iconName = '';
    if (department.Type === AeOrgChartNodeType.Department) {
      iconName = 'icon-org-chart';
      let actions = [{ Title: 'Add', IconName: 'icon-plus', CssClass: 'add', command: this._addSubject },
      { Title: 'Update', IconName: 'icon-cogs', CssClass: 'update', command: this._updateSubject },
      { Title: 'Remove', IconName: 'icon-cross', CssClass: 'remove', command: this._removeSubject }];
      child.Actions = Immutable.List(actions);
    } else if (department.Type === AeOrgChartNodeType.Team) {
      iconName = 'icon-people';
      let actions = [{ Title: 'Update', IconName: 'icon-cogs', CssClass: 'update', command: this._updateSubject },
      { Title: 'Remove', IconName: 'icon-cross', CssClass: 'remove', command: this._removeSubject }];
      child.Actions = Immutable.List(actions);
    }

    let managerName = '';
    let managerId = '';
    let managerEmployee = this._employees
      .filter(e => !isNullOrUndefined(e.Id) &&
        !isNullOrUndefined(department.ManagerId) &&
        e.Id.toLowerCase() === department.ManagerId.toLowerCase());
    if (!isNullOrUndefined(managerEmployee) &&
      managerEmployee.length > 0) {
      managerName = managerEmployee[0].Name;
      managerId = managerEmployee[0].Id;
    }

    child.BodyContext = { Id: managerId, Value: managerName, Icon: iconName, Title: DepartmentType[department.Type] };
    child.HeaderText = department.Name;
    child.Id = department.Id;
    child.NodeType = department.Type;
    if (department.Type === AeOrgChartNodeType.Department) {
      child.CssClass = 'teal';
    } else if (department.Type === AeOrgChartNodeType.Team) {
      child.CssClass = 'yellow';
    } else {
      child.CssClass = '';
    }

    child.Effects = {
      canDrag: (ctx) => true,
      canDrop: (ctx) => this._canDropDeptTeam(ctx, child.Id, AeOrgChartNodeType[child.NodeType])
    };
    return child;
  }

  private _generateStructure(department: DepartmentModel) {
    let child = this._prepareNodeFromDepartment(department);
    if (isNullOrUndefined(child.Children) ||
      (!isNullOrUndefined(child.Children) && child.Children.count() <= 0)) {
      child.Children = Immutable.List([]);
    }
    let children = this._departments.filter(c => c.ParentId.toLowerCase() === department.Id.toLowerCase());
    if (!isNullOrUndefined(children) && children.length > 0) {
      children.forEach((dept) => {
        let childNode = this._generateStructure(dept);
        child.Children = child.Children.concat(childNode).toList();
      });
    }
    return child;
  }

  private _addNodeToTree(node: AeOrgChartNodeModel<{ Id: string, Title: string }>,
    department: DepartmentModel) {
    if (node.Id.toLowerCase() === department.ParentId.toLowerCase()) {
      let child = this._generateStructure(department);
      if (isNullOrUndefined(node.Children) ||
        (!isNullOrUndefined(node.Children) && node.Children.count() <= 0)) {
        node.Children = Immutable.List([]);
      }
      node.Children = node.Children.concat(child).toList();
      this._orgChart.refresh.next(true);
    } else {

      if (!isNullOrUndefined(node.Children)) {
        node.Children.forEach((child) => {
          this._addNodeToTree(child, department);
        });
      }
    }
  }

  private _updateNodeInTree(node: AeOrgChartNodeModel<{ Id: string, Title: string }>
    , department: DepartmentModel) {
    if (node.Id.toLowerCase() === department.Id.toLowerCase()) {
      node.HeaderText = department.Name;
      let deptEmployees = this._employees.filter(e => !isNullOrUndefined(e.DepartmentId) &&
        e.DepartmentId.toLowerCase() === department.Id).map(c => {
          return {
            Id: c.Id,
            Title: c.Name
          };
        }).sort((a, b) => a.Title.localeCompare(b.Title));
      if (!isNullOrUndefined(deptEmployees) && deptEmployees.length > 0) {
        node.DetailsCount = deptEmployees.length;
      } else {
        node.DetailsCount = 0;
      }
      node.Details = Immutable.List(deptEmployees);
      node.BodyContext.Value = '';
      if (!StringHelper.isNullOrUndefinedOrEmpty(department.ManagerId)) {
        let filteredList = this._employees.filter(c => c.Id.toLowerCase() === department.ManagerId.toLowerCase());
        if (!isNullOrUndefined(filteredList) && filteredList.length > 0) {
          node.BodyContext.Value = filteredList[0].Name;
          node.BodyContext.Id = filteredList[0].Id;
        }
      }
      node.Children = node.Children.concat([]).toList();
      this._orgChart.refresh.next(true);
    } else {
      if (!isNullOrUndefined(node.Children)) {
        node.Children.forEach((child) => {
          this._updateNodeInTree(child, department);
        });
      }
    }
  }

  private _removeNodeFromTree(node: AeOrgChartNodeModel<{ Id: string, Title: string }>
    , department: DepartmentModel) {
    if (!isNullOrUndefined(node.Children)) {
      let filtered = node.Children.filter((child) => child.Id.toLowerCase() === department.Id.toLowerCase());
      if (!isNullOrUndefined(filtered) && filtered.count() > 0) {
        node.Children = node.Children.filter((child) => child.Id.toLowerCase() !== department.Id.toLowerCase()).toList();
        this._orgChart.refresh.next(true);
      } else {
        node.Children.forEach((child) => {
          this._removeNodeFromTree(child, department);
        });
      }
    }
  }
  // end of private methods

  // Beginning of public properties
  deleteConfirmModalClosed(e) {
    this._showDeleteConfirmDialog = false;
  }

  deleteDeptTeam(e) {
    this._showDeleteConfirmDialog = false;
    this._store.dispatch(new RemoveCompanyDepartmentAction(this._selectedDeptTeam));
  }

  getDeptType() {
    if (!isNullOrUndefined(this._selectedDeptTeam) &&
      !isNullOrUndefined(this._selectedDeptTeam.Type)) {
      return DepartmentType[this._selectedDeptTeam.Type].toLowerCase();
    }
    return '';
  }

  onEmployeeSelects(empId) {
    this._employeeId = empId;
    this.onEmployeeSelect.emit(empId);
  }

  toggleShowChildren() {
    this._currentState = !this._currentState;
    this._toggleIcon = this._currentState ? 'icon-collapse-down' : 'icon-expand-up';
    this._toggleText = this._currentState ? 'EXPAND_MODE' : 'COLLAPSE_MODE';
    this._showChildren.next(this._currentState);
    this._cdRef.markForCheck();
  }

  printOrgStructure() {
    let orgChart = (<HTMLElement>this._elemRef.nativeElement).getElementsByTagName('ae-org-chart').item(0);
    if (!isNullOrUndefined(orgChart)) {
      let html: string = orgChart.innerHTML;
      this._printChartSubscription = this._manageDepartmentsService.getTemplateForPrint(html).subscribe((content) => {
        let popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        if (!isNullOrUndefined(popupWin)) {
          popupWin.document.open();
          popupWin.document.write(content);
          popupWin.document.close();
          popupWin.print();
          popupWin.close();
        }
      });
    }
  }

  generatePDF() {
    this._loading = true;
    let orgChart = (<HTMLElement>this._elemRef.nativeElement).getElementsByTagName('ae-org-chart').item(0);
    if (!isNullOrUndefined(orgChart)) {
      let html: string = orgChart.innerHTML;
      let companyName = this._claimsHelper.getCompanyName();
      this._generatePDFSubscription = this._manageDepartmentsService.generatePDF(html, orgChart.getBoundingClientRect().width, companyName)
        .subscribe((v) => {
          let fileName = `${companyName} org chart.pdf`;
          let blob = new Blob([v.blob()], { type: 'application/pdf' });
          let url = window.URL.createObjectURL(blob);
          this._loading = false;
          this._cdRef.markForCheck();
          if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, fileName);
          } else {
            let a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
          window.URL.revokeObjectURL(url);
        });
    }

  }

  onDrop(transferData) {
    if (!isNullOrUndefined(transferData) &&
      !StringHelper.isNullOrUndefinedOrEmpty(transferData.SourceId) &&
      !StringHelper.isNullOrUndefinedOrEmpty(transferData.TargetId)) {
      transferData.SourceId = transferData.SourceId.toLowerCase();
      transferData.TargetId = transferData.TargetId.toLowerCase();
      if (transferData.SourceId !== transferData.TargetId) {
        if (transferData.SourceType === AeOrgChartNodeType[AeOrgChartNodeType.Department] ||
          transferData.SourceType === AeOrgChartNodeType[AeOrgChartNodeType.Team]) {
          let sourceDept = Object.assign({}, this._departments.filter((dept) => dept.Id.toLowerCase() === transferData.SourceId)[0]);
          let targetDept = this._departments.filter((dept) => dept.Id.toLowerCase() === transferData.TargetId)[0];
          if (!isNullOrUndefined(sourceDept) &&
            !isNullOrUndefined(targetDept)) {
            sourceDept.ParentId = targetDept.Id;
            sourceDept.ParentDepartmentName = targetDept.Name;
            this._store.dispatch(new UpdateCompanyDepartmentAction(sourceDept));
          }
        } else if (transferData.SourceType === AeOrgChartNodeType[AeOrgChartNodeType.Employee]) {
          this._store.dispatch(new AssignEmployeeToDepartmentAction({
            EmployeeId: transferData.SourceId,
            DepartmentId: transferData.TargetId
          }));
        }

      }
    }
  }

  orgChartFullNormalMode(): boolean {
    return this._orgChartFullView = !this._orgChartFullView;
  }
  FullNormalModeClass(): boolean {
    return this._orgChartFullView === true;
  }

  iconTitleText(): string {
    if (this._orgChartFullView === true) {
      return this._iconTitle = 'NORMAL_MODE';
    } else {
      return this._iconTitle = 'FULL_SCREEN_MODE';
    }
  }

  iconClassName(): string {
    if (this._orgChartFullView === true) {
      return this._iconTitle = 'icon-collapse';
    } else {
      return this._iconTitle = 'icon-expand';
    }
  }
  // End of public properties

  ngOnInit() {
    this._addClickSubscription = this._addSubject.subscribe((c) => {
      if (!isNullOrUndefined(c)) {
        this._addTeamOrDept(c);
      }
    });

    this._updateClickSubscription = this._updateSubject.subscribe((c) => {
      if (!isNullOrUndefined(c)) {
        this._updateTeamOrDept(c);
      }
    });

    this._removeClickSubscription = this._removeSubject.subscribe((c) => {
      if (!isNullOrUndefined(c)) {
        this._removeTeamOrDept(c);
      }
    });

    this._saveSubscription = Observable.combineLatest(
      this._store.let(fromRoot.getCompanyDepartmentAddStatus)
      , this._store.let(fromRoot.getCompanyDepartmentUpdateStatus)
      , this._store.let(fromRoot.getCompanyDepartmentRemoveStatus)
      , this._store.let(fromRoot.getCompanyDepartmentData)
    ).subscribe((values) => {
      let addStatus = StringHelper.coerceBooleanProperty(values[0]);
      let updateStatus = StringHelper.coerceBooleanProperty(values[1]);
      let removeStatus = StringHelper.coerceBooleanProperty(values[2]);
      let department: DepartmentModel = values[3];

      if ((addStatus || updateStatus || removeStatus) &&
        !isNullOrUndefined(department)) {
        if (addStatus) {
          this._addNodeToTree(this._context, department);
        } else if (updateStatus) {
          this._updateNodeInTree(this._context, department);
        } else if (removeStatus) {
          this._removeNodeFromTree(this._context, department);
        }
        this._store.dispatch(new ClearCurrentCompanyDepartmentAction(true));
      }
    });


    this._companyDepartmentsSubscription = this._store.let(fromRoot.getCompanyDepartmentsData).subscribe((depts) => {
      this._departments = depts;
      this._cdRef.markForCheck();
    });

    this._companyEmployeesSubscription = this._store.let(fromRoot.getCompanyEmployeesData).subscribe((emps) => {
      this._employees = emps;
      if (!isNullOrUndefined(emps)) {
        this._initOrgChart();
        this._initialLoadComplete = true;
        this._loading = false;
        this._cdRef.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._addClickSubscription)) {
      this._addClickSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._updateClickSubscription)) {
      this._updateClickSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._removeClickSubscription)) {
      this._removeClickSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._saveSubscription)) {
      this._saveSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._companyDepartmentsSubscription)) {
      this._companyDepartmentsSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._companyEmployeesSubscription)) {
      this._companyEmployeesSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._printChartSubscription)) {
      this._printChartSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._generatePDFSubscription)) {
      this._generatePDFSubscription.unsubscribe();
    }
  }
}
