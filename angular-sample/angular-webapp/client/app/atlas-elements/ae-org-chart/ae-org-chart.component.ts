import {
  Component
  , OnInit
  , ChangeDetectionStrategy
  , ViewEncapsulation
  , Input
  , Output
  , EventEmitter
  , ChangeDetectorRef,
  ElementRef,
  AfterContentInit,
  OnDestroy,
  ViewChild,
  Renderer2,
  AfterViewInit
} from '@angular/core';
import { trigger, state, style } from '@angular/animations';
import { BaseElement } from '../common/base-element';
import { AeOrgChartNodeModel, AeOrgChartNodeType } from '../common/models/ae-org-chart-node-model';
import { BehaviorSubject, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { StringHelper } from '../../shared/helpers/string-helper';
import { AeOrgChartNodeComponent } from './ae-org-chart-node/ae-org-chart-node.component';
import { Subject } from 'rxjs/Subject';
import { AeOrgChartService } from './services/ae-org-chart.service';
import TweenLite from 'gsap/TweenLite';
import Draggable from 'gsap/Draggable';
import { CommonHelpers } from '../../shared/helpers/common-helpers';

@Component({
  selector: 'ae-org-chart',
  templateUrl: './ae-org-chart.component.html',
  styleUrls: ['./ae-org-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeOrgChartComponent<T> extends BaseElement implements OnInit, AfterContentInit, AfterViewInit, OnDestroy {
  // Private Fields
  private _context: AeOrgChartNodeModel<T>;
  private _transform: string;
  private _zoomLevel: number;
  private _probablePan: boolean;
  private _intialX: number;
  private _intialY: number;
  private _deltaX: number;
  private _deltaY: number;
  private _refresh: Subject<boolean> = new Subject<boolean>();
  private _refreshSubscription: Subscription;
  private _expandStateSubscription: Subscription;
  private _dropStartSubscription: Subscription;
  private _toggleChildren: Subject<boolean>;
  private _dragStartSubscription: Subscription;
  private _toggleChildrenSubscription: Subscription;
  private _draggableInstance: any;
  private _currentToggleStatus: boolean;
  private _mouseMoveSubscription: Subscription;
  private _mouseOutSubscription: Subscription;
  private _rootToggleSubscription: Subscription;
  // End of Private Fields

  // Public Properties
  @Input('context')
  set context(val: AeOrgChartNodeModel<T>) {
    this._context = val;
  }
  get context() {
    return this._context;
  }


  @Input('toggleChildren')
  set toggleChildren(val: Subject<boolean>) {
    this._toggleChildren = val;
  }
  get toggleChildren() {
    return this._toggleChildren;
  }


  get refresh() {
    return this._refresh;
  }
  // End of Public Properties


  // View Child Properties
  @ViewChild('rootNode')
  _rootNode: AeOrgChartNodeComponent<any>;

  @ViewChild('container')
  _container;

  @ViewChild('rootContainer')
  _rootContainer;
  // End of View Child Properties

  // Output Bindings
  @Output('showEmployee')
  showDetails: EventEmitter<{ NodeType: AeOrgChartNodeType, Id: string }>;

  @Output('selectDetailItem')
  selectDetailItem: EventEmitter<string>;

  @Output()
  onDrop: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  print: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  downloadPDF: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  expandStateChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  //End of Output Bindings

  // Content Child Properties
  // End of Content Child Properties


  // Constructor
  constructor(private _cdr: ChangeDetectorRef
    , private _elRef: ElementRef
    , private _renderer: Renderer2
    , private _aeOrgChartService: AeOrgChartService) {
    super();
    this._zoomLevel = 1;
    this._probablePan = false;
    this.showDetails = new EventEmitter();
    this.selectDetailItem = new EventEmitter();
    this._deltaX = 0;
    this._deltaY = 0;
  }
  // End Of Constructor

  // Private Methods

  private _containerClick(event: MouseEvent) {
  }

  zoomIn(event: MouseEvent) {
    if (!this.isHigherZoom()) {
      if (!isNullOrUndefined(this._draggableInstance)) {
        this._draggableInstance.disable();
      }
      this._zoomLevel = Math.min(Math.max(this._zoomLevel + 0.25, 0.2), 2);
      // let chartElement: HTMLElement = this._elRef.nativeElement;
      let chartElement = this._container.nativeElement;
      let rootElement = this._rootContainer.nativeElement;
      let rootParentEle = rootElement.parentNode;
      TweenLite.set(chartElement, {
        css: {
          transform:
          'translate3d(' + (chartElement.getBoundingClientRect().width - rootParentEle.getBoundingClientRect().width) / 2 + 'px,0,0) scale(' + this._zoomLevel + ')'
        }
      });
    }
    if (!isNullOrUndefined(event)) {
      event.stopPropagation();
    }

    // this._zoomLevel = Math.min(Math.max(this._zoomLevel + 0.25, 0.25), 2);
    // this._scaleTransform();
    // if (!isNullOrUndefined(event)) {
    //   event.stopPropagation();
    // }
  }

  zoomOut(event: MouseEvent) {
    if (!this.isLowerZoom()) {
      this._zoomLevel = Math.min(Math.max(this._zoomLevel - 0.25, 0.25), 2);
      // this._scaleTransform();
      let chartElement = this._container.nativeElement;
      let rootElement = this._rootContainer.nativeElement;
      let rootParentEle = rootElement.parentNode;
      TweenLite.set(chartElement, {
        css: {
          transform:
          'translate3d(' + (chartElement.getBoundingClientRect().width - rootParentEle.getBoundingClientRect().width) / 2 + 'px,0,0) scale(' + this._zoomLevel + ')'
        }
      });
    }
    if (!isNullOrUndefined(event)) {
      event.stopPropagation();
    }
  }

  private _scaleTransform() {
    this._renderer.setStyle(this._container.nativeElement, 'transform', `scale(${this._zoomLevel})`);
    this._renderer.setStyle(this._container.nativeElement, 'transform-origin', 'left 0px');
  }

  private _translateTransform(xDelta: number, yDelta: number) {
    this._renderer.setStyle(this._container.nativeElement, 'transform', `translate(${xDelta}px, ${yDelta}px)`);
    this._renderer.setStyle(this._container.nativeElement, 'cursor', 'move');
  }

  private _coerceTranslateTransform(xDelta: number, yDelta: number) {
    let parentEle = this._elRef.nativeElement.parentNode;
    let parentWidth = parentEle.offsetWidth;
    let leftOffset = parentWidth - this._container.nativeElement.offsetWidth;
    let topOffset = this._rootContainer.nativeElement.offsetHeight - this._container.nativeElement.offsetHeight + 80 + 41;
    let change = false;
    if (xDelta > 0) {
      xDelta = 0;
      this._deltaX = xDelta;
      change = true;
    } else if (xDelta < leftOffset) {
      xDelta = leftOffset;
      this._deltaX = xDelta;
      change = true;
    }
    if (yDelta > 0) {
      yDelta = 0;
      this._deltaY = yDelta;
      change = true;
    } else if (yDelta < topOffset) {
      yDelta = topOffset;
      this._deltaY = yDelta;
      change = true;
    }
    if (change) {
      this._renderer.setStyle(this._container.nativeElement, 'transform', `translate(${xDelta}px, ${yDelta}px)`);
    }
  }

  _selectDetailItem(e) {
    this.selectDetailItem.emit(e);
  }

  _print(e) {
    window.print();
  }

  download(e) {
    this.downloadPDF.emit(true);
  }

  private _reload() {
    this._rootNode.reload();
  }

  isHigherZoom() {
    return this._zoomLevel >= 2;
  }

  isLowerZoom() {
    return this._zoomLevel <= 0.25;
  }

  private _onNodeDragStart(event) {
    this._probablePan = false;
  }

  private _changeChartPosition() {
    let parentEle = this._rootContainer.nativeElement.parentNode.parentNode;
    let width = (<HTMLElement>parentEle).getBoundingClientRect().width;
    this._renderer.setStyle(<HTMLElement>this._rootContainer.nativeElement, 'width', width + 'px');
    let chartElement: HTMLElement = this._container.nativeElement;
    this._renderer.setStyle(chartElement, 'transform', `translate(0px, 0px)`);
  }
  // End of Private Methods

  // Public methods
  ngOnInit() {
    super.ngOnInit();
    this._refreshSubscription = this._refresh.subscribe(val => {
      if (StringHelper.coerceBooleanProperty(val)) {
        this._reload();
        this._refresh.next(false);
      }
    });

    this._toggleChildrenSubscription = this._toggleChildren.subscribe((status) => {
      this._rootNode.onShowChildren(status);
      if (!status) {
        this._currentToggleStatus = true;
        this._changeChartPosition();
      } else {
        this._renderer.setStyle(<HTMLElement>this._rootContainer.nativeElement, 'width', '100%');
      }
    });

    this._dragStartSubscription = this._aeOrgChartService.dragStartEvent.subscribe((val) => {
      this._onNodeDragStart(val);
    });

    this._dropStartSubscription = this._aeOrgChartService.dropStartEvent.subscribe((val) => {
      this.onDrop.emit(val);
    });

    this._mouseMoveSubscription =
      this._aeOrgChartService.mouseMoveEvent.subscribe((val) => {
        if (!isNullOrUndefined(this._draggableInstance) &&
          this._draggableInstance.enabled()) {
          this._draggableInstance.disable();

          if (this._currentToggleStatus === true) {
            this._changeChartPosition();
          } else {
            this._renderer.setStyle(<HTMLElement>this._rootContainer.nativeElement, 'width', '100%');
          }
        }
      });

    this._mouseOutSubscription =
      this._aeOrgChartService.mouseOutEvent.subscribe((val) => {
        if (!isNullOrUndefined(this._draggableInstance) &&
          !this._draggableInstance.enabled()) {
          this._draggableInstance.enable();
          if (this._currentToggleStatus === true) {
            this._changeChartPosition();
            this._currentToggleStatus = false;
          } else {
            this._renderer.setStyle(<HTMLElement>this._rootContainer.nativeElement, 'width', '100%');
          }
        }
      });

    this._rootToggleSubscription =
      this._aeOrgChartService.rootToggleEvent.subscribe((status) => {
        if (!status) {
          this._currentToggleStatus = true;
          this._changeChartPosition();
        } else {
          this._renderer.setStyle(<HTMLElement>this._rootContainer.nativeElement, 'width', '100%');
        }
      });
  }

  ngAfterViewInit(): void {
    let chartContainerElement: HTMLElement = this._rootContainer.nativeElement;
    let chartElement: HTMLElement = this._container.nativeElement;
    let parentEle = chartContainerElement.parentNode.parentNode;
    this._draggableInstance = Draggable.create(chartElement, {
      bounds: parentEle,
      type: 'x,y',
      zIndexBoost: false,
      trigger: parentEle
    })[0];
  }

  ngAfterContentInit(): void {

  }

  ngOnDestroy(): void {
    if (!isNullOrUndefined(this._expandStateSubscription)) {
      this._expandStateSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._refreshSubscription)) {
      this._refreshSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._dropStartSubscription)) {
      this._dropStartSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._dragStartSubscription)) {
      this._dragStartSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._toggleChildrenSubscription)) {
      this._toggleChildrenSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._rootToggleSubscription)) {
      this._rootToggleSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._mouseMoveSubscription)) {
      this._mouseMoveSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._mouseOutSubscription)) {
      this._mouseOutSubscription.unsubscribe();
    }
  }
  // End of Public methods
}
