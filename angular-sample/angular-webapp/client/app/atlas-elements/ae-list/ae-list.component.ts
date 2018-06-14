import { StringHelper } from '../../shared/helpers/string-helper';
import { BaseElement } from '../common/base-element';
import { BaseElementGeneric } from '../common/base-element-generic';
import { AeListItem } from '../common/models/ae-list-item';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
  AfterViewInit,
  ElementRef,
  Renderer2,
  ViewChild,
  HostListener
} from '@angular/core';
import * as Immutable from 'immutable';
import { isNullOrUndefined } from 'util';

declare var SimpleBar: any;

/**
 * Atlas List Component that displays provided items in a list manner. 
 * 
 * @export
 * @class AeListComponent
 * @extends {BaseElement}
 */
@Component({
  selector: 'ae-list',
  templateUrl: './ae-list.component.html',
  styleUrls: ['./ae-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AeListComponent extends BaseElement implements AfterViewInit {
  // Private fields start
  private _items: Immutable.List<AeListItem>;
  private _hasLine: boolean = false;
  private _isClickable: boolean = false;
  private _requireCircle: boolean = true;
  private _applyScroll: boolean = false;
  private _maxHeight: string;
  private _autoHide: boolean = false;
  private _scrollElement: any;
  // Private fields End

  // Public properties start  
  /**
   * Represents list of items to display
   * 
   * @type AeListItem[]
   * 
   * @memberOf AeListComponent
   */
  @Input()
  get items() {
    return this._items;
  }
  set items(value: Immutable.List<AeListItem>) {
    this._items = value;
  }


  /**
   * Whether list has line.
   * 
   * @type boolean
   * get/set property
   * 
   * @memberOf AeListComponent
   */
  @Input('hasline')
  get hasLine() {
    return this._hasLine;
  }
  set hasLine(value: boolean) {
    this._hasLine = StringHelper.coerceBooleanProperty(value);
  }

  @Input('isClickable')
  get isClickable() {
    return this._isClickable;
  }
  set isClickable(value: boolean) {
    this._isClickable = StringHelper.coerceBooleanProperty(value);
  }

  @Input('requireCircle')
  get requireCircle() {
    return this._requireCircle;
  }
  set requireCircle(value: boolean) {
    this._requireCircle = StringHelper.coerceBooleanProperty(value);
  }

  @Input('scroll')
  get applyScroll() {
    return this._applyScroll;
  }
  set applyScroll(value: boolean) {
    this._applyScroll = StringHelper.coerceBooleanProperty(value);
  }

  @Input('maxheight')
  get maxHeight() {
    return this._maxHeight;
  }
  set maxHeight(value: string) {
    this._maxHeight = value;
  }

  @Input('autoHideScroll')
  get autoHide() {
    return this._autoHide;
  }
  set autoHide(value: boolean) {
    this._autoHide = value;
  }
  // public fields end

  // ouput properties start
  /**
   * Informs the component when the action link is clicked.
   * 
   * @type {EventEmitter<any>}
   * @memberOf AeListComponent
   */
  @Output() aeAction: EventEmitter<any> = new EventEmitter<any>();
  //output properties end

  ulNode: ElementRef;

  @ViewChild('ulNode') set ulNodeSetter(node: ElementRef) {
    this.ulNode = node;
    this.initSimplebar();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.initSimplebar();
  }

  // constructor start
  /**
   * Creates an instance of AeListComponent.
   * @param {ChangeDetectorRef} cdRef 
   * 
   * @memberOf AeListComponent
   */
  constructor(public cdRef: ChangeDetectorRef
    , private _elRef: ElementRef
    , private _renderer: Renderer2) {
    super();
  }
  //constructor end

  // public methods start
  getCursorClass(item: AeListItem): string {
    return item.IsClickable ? '' : 'cursor-default';
  }
  IsNonClickable(item: AeListItem): boolean {
    return !item.IsClickable;
  }
  /** This method gets called when user clicks on action link.
   * 
   * 
   * @param {any} item 
   * @param {any} e 
   * 
   * @memberOf AeListComponent
   */
  onAeAction(item: AeListItem, e) {
    if (item.IsClickable) {
      this.aeAction.emit({ selectedItem: item, event: e });
    } else {
      e.stopPropagation();
    }
  }
  //public methods end

  // private methods start
  private _hasNotification(item) {
    return item.isNotification;
  }

  getMaxHeight(): string {
    if (this.applyScroll && !StringHelper.isNullOrUndefinedOrEmpty(this.maxHeight)) {
      return this.maxHeight;
    }
    return null;
  }

  hasScroll(): boolean {
    if (this.applyScroll) {
      return true;
    }
    return false;
  }

  hasItems() {
    if (!isNullOrUndefined(this._items) &&
      Immutable.Iterable.isIterable(this._items) &&
      this._items.count() > 0) {
      return true;
    }
    return false;
  }

  public initSimplebar() {
    if (this.hasItems() && this.hasScroll() && !isNullOrUndefined(this.ulNode)) {
      if (isNullOrUndefined(this._scrollElement)) {
        this._scrollElement = new SimpleBar(this.ulNode.nativeElement, { autoHide: false });
      } else {
        this._scrollElement.recalculate();
      }
    }
  }

  ngAfterViewInit(): void {

  }
  // private methods end
}
