import { AeIconSize } from '../../common/ae-icon-size.enum';
import {
  Component
  , OnInit
  , AfterContentInit
  , ViewChild
  , TemplateRef
  , ViewEncapsulation
  , ChangeDetectionStrategy
  , ComponentFactoryResolver
  , ComponentFactory
  , ViewContainerRef
  , Input
  , Output
  , EventEmitter
  , ChangeDetectorRef,
  OnDestroy,
  ComponentRef,
  Renderer2,
  ElementRef
} from '@angular/core';
import { BaseElement } from '../../common/base-element';
import { AeOrgChartNodeModel, AeOrgChartNodeType } from '../../common/models/ae-org-chart-node-model';
import { isNullOrUndefined } from 'util';
import * as Immutable from 'immutable';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { Subject } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { AeDropVm } from '../../ae-drag-drop/common/models/ae-drop-vm';
import { AeDragVm } from '../../ae-drag-drop/common/models/ae-drag-vm';
import { AeOrgChartService } from '../services/ae-org-chart.service';

@Component({
  selector: 'ae-org-chart-node',
  templateUrl: './ae-org-chart-node.component.html',
  styleUrls: ['./ae-org-chart-node.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeOrgChartNodeComponent<T> extends BaseElement implements OnInit, AfterContentInit, OnDestroy {
  // Private Fields
  private _showChildren: boolean;
  private _showNodeDetails: boolean;
  private _componentFactory: ComponentFactory<AeOrgChartNodeComponent<any>>;
  private _context: AeOrgChartNodeModel<T>;
  private _iconTiny: AeIconSize = AeIconSize.tiny;
  private _iconSmall: AeIconSize = AeIconSize.small;
  private _filterName: string = '';
  private _filteredDetails: Immutable.List<{ Id: string, Title: string }> = Immutable.List([]);
  private _actions: Immutable.List<{ Title: string, IconName: string, CssClass: string, command: Subject<any> }> = Immutable.List([]);
  private _refreshTrigger: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private _toggleChildren: Subject<boolean>;
  private _refreshTriggerSubscription: Subscription;
  private _toggleChildrenSubscription: Subscription;
  private _selectedDetailSubscription: Subscription;
  private _dropSubscription: Subscription;
  private _childRef: ComponentRef<AeOrgChartNodeComponent<any>>;
  private _expandStateChange: Subject<boolean> = new Subject();
  isDragEnter: boolean = false;
  // End of Private Fields

  // Getters
  get showChildren(): boolean {
    return this._showChildren;
  }
  set showChildren(val: boolean) {
    this._showChildren = val;
  }

  get actions(): Immutable.List<{ Title: string, IconName: string, CssClass: string, command: Subject<any> }> {
    return this._actions;
  }

  get filterName(): string {
    return this._filterName;
  }
  set filterName(val: string) {
    this._filterName = val;
  }

  get iconSmall(): AeIconSize {
    return this._iconSmall;
  }
  get expandStateChange(): Subject<boolean> {
    return this._expandStateChange;
  }

  get iconTiny(): AeIconSize {
    return this._iconTiny;
  }

  get filteredDetails(): Immutable.List<{ Id: string, Title: string }> {
    return this._filteredDetails;
  }
  // End of Getters

  // Public Properties
  @Input('context')
  get context() {
    return this._context;
  }
  set context(val: AeOrgChartNodeModel<T>) {
    this._context = val;
    if (!isNullOrUndefined(val)) {
      this._filterName = '';
      this._filteredDetails = val.Details;
      this._actions = val.Actions;
    }
    this._cdr.markForCheck();
  }

  @Input('refresh')
  get refreshTrigger() {
    return this._refreshTrigger.getValue();
  }
  set refreshTrigger(val: boolean) {
    this._refreshTrigger.next(val);
  }

  set aeOrgChartService(val: AeOrgChartService) {
    this._aeOrgChartService = val;
  }
  // End of Public Properties

  // Output Bindings
  @Output('showEmployee')
  showDetails: EventEmitter<{ NodeType: AeOrgChartNodeType, Id: string }>;
  @Output('selectDetailItem')
  selectDetailItem: EventEmitter<string>;
  @Output()
  onDrop: EventEmitter<any>;
  // End of Output Bindings

  // Content Child Properties
  // End of Content Child Properties


  // View Child Properties
  @ViewChild('childGroup', { read: ViewContainerRef })
  _childGroup: ViewContainerRef;

  @ViewChild('defaultBodyTemplate')
  _defaultBodyTemplate: TemplateRef<any>;

  @ViewChild('orgNode')
  _orgNode: ElementRef;
  // End of View Child Properties

  // Constructor
  constructor(private _cfr: ComponentFactoryResolver
    , private _cdr: ChangeDetectorRef
    , private _elRef: ElementRef
    , private _renderer: Renderer2
    , private _aeOrgChartService: AeOrgChartService) {
    super();
    this._showNodeDetails = false;
    this._showChildren = true;
    this._componentFactory = this._cfr.resolveComponentFactory(AeOrgChartNodeComponent);
    this.showDetails = new EventEmitter();
    this.selectDetailItem = new EventEmitter();
    this.onDrop = new EventEmitter<any>();
  }
  // End Of Constructor
  // Private Methods
  dropped(e) {
    let targetModel = { TargetId: this._context.Id, TargetType: AeOrgChartNodeType[this._context.NodeType] };
    let finalModel = Object.assign({}, targetModel, e.model);
    this._aeOrgChartService.dropStartEvent.emit(finalModel);
    return false;
  }

  onDragStart(event) {
    this._aeOrgChartService.dragStartEvent.emit(event);
  }

  filterByName(e) {
    if (StringHelper.isNullOrUndefinedOrEmpty(this._filterName)) {
      this._filterName = '';
    }

    if (!isNullOrUndefined(this._context.Details)) {
      this._filteredDetails = this._context.Details
        .filter((c) => c.Title.toLowerCase().indexOf(this._filterName.toLowerCase()) !== -1)
        .toList();
    }
  }

  getHeaderText() {
    return this._context.HeaderText;
  }

  getBodyTemplate() {
    if (isNullOrUndefined(this._context.BodyTemplate)) {
      return this._defaultBodyTemplate;
    }
    return this._context.BodyTemplate.template;
  }

  getBodyContext() {
    return this._context.BodyContext;
  }

  public get canShowNodeDetails() {
    return this._showNodeDetails;
  }

  onShowDetailsClick(event) {
    this._showNodeDetails = !this._showNodeDetails;
    if (this._showNodeDetails) {
      this._filterName = '';
      this.filterByName(null);
    }
  }

  onActionClick(action: { Title: string, IconName: string, CssClass: string, command: Subject<any> }) {
    if (!isNullOrUndefined(action)) {
      action.command.next({ NodeType: this._context.NodeType, Id: this._context.Id, Action: action });
    }
  }

  onDetailItemClick($event) {
    this.selectDetailItem.next($event);
  }

  hasChildren() {
    return (!isNullOrUndefined(this._context.Children) &&
      this._context.Children.count() > 0);
  }

  canHighlightDetailItem(itemId: string) {
    return !isNullOrUndefined(this._context) &&
      !isNullOrUndefined(this._context.BodyContext) &&
      !StringHelper.isNullOrUndefinedOrEmpty(this._context.BodyContext.Value) &&
      this._context.BodyContext.Id.toLowerCase() === itemId.toLowerCase();
  }

  private _createChildren(initialLoad: boolean) {
    if (!isNullOrUndefined(this._context.Children) &&
      this._context.Children.count() > 0 && this._showChildren) {
      this._context.Children.forEach(child => {
        let childRef = this._childGroup.createComponent(this._componentFactory);

        this._selectedDetailSubscription = childRef.instance.selectDetailItem.subscribe((itemId: string) => {
          this.selectDetailItem.emit(itemId);
        });

        this._dropSubscription = childRef.instance.onDrop.subscribe((e) => {
          if (!isNullOrUndefined(e) &&
            !StringHelper.isNullOrUndefinedOrEmpty(e.EmployeeId)) {
            this.onDrop.emit(e);
          }
        });
        childRef.instance.context = child;
        childRef.instance.aeOrgChartService = this._aeOrgChartService;
      });
    }
  }

  getCssClass() {
    if (!isNullOrUndefined(this._context)) {
      return this._context.CssClass;
    }
    return null;
  }

  getDroppableVm(): AeDropVm<any> {
    return {
      canDrop: isNullOrUndefined(this._context.Effects.canDrop) ? (context) => true : this._context.Effects.canDrop,
      dropEffect: 'move',
      identifiers: null
    };
  }

  getDraggableVm(): AeDragVm<any> {
    return {
      dragEffect: null,
      identifier: AeOrgChartNodeType[this._context.NodeType],
      canChildrenDraggableIndependently: false,
      canDragHandleContainer: true,
      dragHandle: null,
      canDrag: isNullOrUndefined(this._context.Effects.canDrag) ? (context) => true : this._context.Effects.canDrag,
      model: { SourceId: this._context.Id, SourceType: AeOrgChartNodeType[this._context.NodeType] }
    };
  }

  getDetailDraggableVm(employeeId: string): AeDragVm<any> {
    return {
      dragEffect: null,
      identifier: AeOrgChartNodeType[AeOrgChartNodeType.Employee],
      canChildrenDraggableIndependently: false,
      canDragHandleContainer: true,
      dragHandle: null,
      canDrag: isNullOrUndefined(this._context.Effects.canDrag) ? (context) => true : this._context.Effects.canDrag,
      model: { SourceId: employeeId, SourceType: AeOrgChartNodeType[AeOrgChartNodeType.Employee] }
    };
  }
  // End of Private Methods

  // Public methods
  public reload() {
    this._childGroup.clear();
    this._createChildren(false);
  }

  onShowChildren(data) {
    if (!isNullOrUndefined(this._context.Children) &&
      this._context.Children.count() > 0) {
      this._showChildren = !this._showChildren;
      if (this._showChildren) {
        if (!isNullOrUndefined(data)) {
          this._createChildren(true);
        } else {
          this._createChildren(false);
        }
      } else {
        this._childGroup.clear();
      }

      if (this._context.NodeType === AeOrgChartNodeType.Company &&
        !isNullOrUndefined(this._aeOrgChartService.rootToggleEvent)) {
        this._aeOrgChartService.rootToggleEvent.emit(this._showChildren);
      }
    }
  }

  dragEnter(event) {
    this.isDragEnter = true;
  }
  dragOver(event) {
    this.isDragEnter = true;
  }

  dragLeave(event) {
    this.isDragEnter = false;
  }
  ngOnInit(): void {
  }

  ngAfterContentInit(): void {
    this._createChildren(true);
  }

  ngOnDestroy(): void {
    if (!isNullOrUndefined(this._toggleChildrenSubscription)) {
      this._toggleChildrenSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._refreshTriggerSubscription)) {
      this._refreshTriggerSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._selectedDetailSubscription)) {
      this._selectedDetailSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._dropSubscription)) {
      this._dropSubscription.unsubscribe();
    }
  }

  nodeMouseMove(e) {
    this._aeOrgChartService.mouseMoveEvent.emit(e);
  }

  nodeMouseOut(e) {
    this._aeOrgChartService.mouseOutEvent.emit(e);
  }
  // End of Public methods
}
