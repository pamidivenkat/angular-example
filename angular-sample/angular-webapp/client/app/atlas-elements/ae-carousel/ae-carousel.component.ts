import { isNullOrUndefined } from 'util';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { AeCarouselDirection } from "../common/ae-corousel-direction.enum";
import { AeNav } from '../common/ae-nav.enum';
import { BaseElement } from '../common/base-element';
import { AeTemplateComponent } from '../ae-template/ae-template.component';
import * as Immutable from 'immutable';
import { BehaviorSubject, Subscription } from 'rxjs/Rx';

@Component({
  selector: 'ae-carousel',
  templateUrl: './ae-carousel.component.html',
  styleUrls: ['./ae-carousel.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeCarouselComponent<T> extends BaseElement implements OnInit, OnDestroy, AfterContentInit {

  // Private Fields
  private _interval: number;
  private _forward: AeNav = AeNav.Forward;
  private _backward: AeNav = AeNav.Backward;
  private _template: AeTemplateComponent<any>;
  private _currentIndex: number;
  private _itemSource: BehaviorSubject<Immutable.List<T>>;
  private _items: Immutable.List<T>;
  private _totalItems: number = 0;
  private _context: T;
  // End of Private Fields

  // Public properties
  get backward(): AeNav {
    return this._backward;
  }

  get forward(): AeNav {
    return this._forward;
  }

  get currentIndex(): number {
    return this._currentIndex;
  }

  get totalItems(): number {
    return this._totalItems;
  }

  @Input() public noWrap: boolean;
  @Input() public noPause: boolean;
  @Input() public noTransition: boolean;

  @Input('interval')
  get interval(): number {
    return this._interval;
  }
  set interval(value: number) {
    this._interval = value;
  }

  @Input('items')
  set items(value: BehaviorSubject<Immutable.List<any>>) {
    this._itemSource = value;
  }
  get items() {
    return this._itemSource;
  }

  // End of Public properties

  // Public ViewContent bindings
  @ContentChild(AeTemplateComponent)
  template: AeTemplateComponent<any>;
  // End of Public ViewContent bindings

  //Constructor
  constructor(private _cdRef: ChangeDetectorRef, ) {
    super();
    this._currentIndex = 0;
  }
  // End of constructor
  // Private methods
  getTemplate() {
    return this.template.template;
  }

  getContext() {
    return this._context;
  }

  private _pause() { }
  private _play() { }
  isIndicatorsVisible() {
    return this._totalItems > 0;
  }

  previous() {
    if (this._currentIndex > 0) {
      this._currentIndex -= 1;
    } else {
      this._currentIndex = 0;
    }
    this._updateContext();
  }

  next() {
    if (this._currentIndex < this._totalItems - 1) {
      this._currentIndex += 1;
    } else {
      this._currentIndex = this._totalItems - 1;
    }
    this._updateContext();
  }

  private _updateContext() {
    let nextItem = this._items.get(this._currentIndex);
    for (let key in this._context) {
      this._context[key] = null;
    }
    for (let key in this._context) {
      this._context[key] = nextItem[key];
    }
  }

  isCurrentItem(index: number) {
    return this._currentIndex === index;
  }

  selectItem(index: number) {
    this._currentIndex = index;
    this._updateContext();
  }

  // End of private methods

  // Public methods
  ngAfterContentInit(): void {
    this._template = this.template;
  }

  ngOnInit() {
    super.ngOnInit();
    this._itemSource.subscribe((value) => {
      if (value.count() > 0) {
        this._context = Object.create(<any>value.get(0));
        this._items = value;
        this._totalItems = this._items.count();
        this._cdRef.markForCheck();
      }
    })

  }

  ngOnDestroy() { }
  // End of public methods
}
