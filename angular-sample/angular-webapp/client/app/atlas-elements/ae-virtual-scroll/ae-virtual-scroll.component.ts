import { AeChangeEvent } from '../common/models/ae-change-event';
import { isNullOrUndefined } from 'util';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    Renderer,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
    HostListener
} from '@angular/core';
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";

@Component({
    selector: 'ae-virtual-scroll',
    templateUrl: './ae-virtual-scroll.component.html',
    styleUrls: ['./ae-virtual-scroll.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class AeVirtualScrollComponent implements OnInit {

    // Private Fields
    private _items: any[];
    private _scrollbarWidth: number;
    private _scrollbarHeight: number;
    private _childWidth: number;
    private _childHeight: number;
    private _onScrollListener: Function;
    private _topPadding: number;
    private _scrollHeight: number;
    private _previousStart: number;
    private _previousEnd: number;
    private _startupLoop: boolean = true;

    _scroll$: Subject<Event> = new Subject<Event>();

    // End of Private Fields

    //Getters
    get topPadding(){
        return this._topPadding;
    }

    get scrollHeight(){
        return this._scrollHeight;
    }
    //End of getters

    // Public properties
    @Input('items')
    get items() {
        return this._items;
    }
    set items(val: any[]) {
        this._items = val;
    }

    @Input('scrollbarWidth')
    get scrollbarWidth(): number {
        return this._scrollbarWidth;
    }
    set scrollbarWidth(val: number) {
        this._scrollbarWidth = val;
    }

    @Input('scrollbarHeight')
    get scrollbarHeight(): number {
        return this._scrollbarHeight;
    }
    set scrollbarHeight(val: number) {
        this._scrollbarHeight = val;
    }

    @Input('childWidth')
    get childWidth(): number {
        return this._childWidth;
    }
    set childWidth(val: number) {
        this._childWidth = val;
    }

    @Input('childHeight')
    get childHeight(): number {
        return this._childHeight;
    }
    set childHeight(val: number) {
        this._childHeight = val;
    }
    // End of Public properties

    // Public Output bindings
    @Output()
    update: EventEmitter<any[]> = new EventEmitter<any[]>();

    @Output()
    change: EventEmitter<AeChangeEvent> = new EventEmitter<AeChangeEvent>();

    @Output()
    start: EventEmitter<AeChangeEvent> = new EventEmitter<AeChangeEvent>();

    @Output()
    end: EventEmitter<AeChangeEvent> = new EventEmitter<AeChangeEvent>();

    // End of Public Output bindings

    // Public ViewChild bindings

    @ViewChild('content', { read: ElementRef })
    contentElementRef: ElementRef;

    // End of Public ViewChild bindings

    // Public ContentChild bindings
    // End of Public ContentChild bindings

    // Constructor
    constructor(private _element: ElementRef, private _renderer: Renderer) { }
    // End of constructor

    // Host bindings
    @HostListener('scroll')
    onscroll(event: Event) {
        this._scroll$.next();
    }
    // End of Host bindings

    // Private methods
    private _scrollInto(item: any) {
        let index: number = (this._items || []).indexOf(item);
        if (index < 0 || index >= (this.items || []).length) return;

        let d = this._calculateDimensions();
        this._element.nativeElement.scrollTop = Math.floor(index / d.itemsPerRow) *
            d.childHeight - Math.max(0, (d.itemsPerCol - 1)) * d.childHeight;
        this.refresh();
    }

    private _countItemsPerRow() {
        let offsetTop;
        let itemsPerRow;
        let children = this.contentElementRef.nativeElement.children;
        for (itemsPerRow = 0; itemsPerRow < children.length; itemsPerRow++) {
            if (offsetTop != undefined && offsetTop !== children[itemsPerRow].offsetTop) {
                break;
            }
            offsetTop = children[itemsPerRow].offsetTop;
        }
        return itemsPerRow;
    }

    private _calculateDimensions() {
        let el = this._element.nativeElement;
        let content = this.contentElementRef.nativeElement;

        let items = this.items || [];
        let itemCount = items.length;
        let viewWidth = el.clientWidth - this._scrollbarWidth;
        let viewHeight = el.clientHeight - this._scrollbarHeight;

        let contentDimensions;
        if (isNullOrUndefined(this._childWidth) || isNullOrUndefined(this._childHeight)) {
            contentDimensions = content.children[0] ? content.children[0].getBoundingClientRect() : {
                width: viewWidth,
                height: viewHeight
            };
        }
        let childWidth = this._childWidth || contentDimensions.width;
        let childHeight = this._childHeight || contentDimensions.height;

        let itemsPerRow = Math.max(1, this._countItemsPerRow());
        let itemsPerRowByCalc = Math.max(1, Math.floor(viewWidth / childWidth));
        let itemsPerCol = Math.max(1, Math.floor(viewHeight / childHeight));
        if (itemsPerCol === 1 && Math.floor(el.scrollTop / this._scrollHeight * itemCount) + itemsPerRowByCalc >= itemCount) {
            itemsPerRow = itemsPerRowByCalc;
        }

        return {
            itemCount: itemCount,
            viewWidth: viewWidth,
            viewHeight: viewHeight,
            childWidth: childWidth,
            childHeight: childHeight,
            itemsPerRow: itemsPerRow,
            itemsPerCol: itemsPerCol,
            itemsPerRowByCalc: itemsPerRowByCalc
        };
    }

    private _calculateItems() {
        let el = this._element.nativeElement;

        let d = this._calculateDimensions();
        let items = this._items || [];
        this._scrollHeight = d.childHeight * d.itemCount / d.itemsPerRow;
        if (this._element.nativeElement.scrollTop > this._scrollHeight) {
            this._element.nativeElement.scrollTop = this._scrollHeight;
        }

        let indexByScrollTop = el.scrollTop / this._scrollHeight * d.itemCount / d.itemsPerRow;
        let end = Math.min(d.itemCount, Math.ceil(indexByScrollTop) * d.itemsPerRow + d.itemsPerRow * (d.itemsPerCol + 1));
        let maxStart = Math.max(0, end - d.itemsPerCol * d.itemsPerRow - d.itemsPerRow);
        let start = Math.min(maxStart, Math.floor(indexByScrollTop) * d.itemsPerRow);

        this._topPadding = d.childHeight * Math.ceil(start / d.itemsPerRow);
        if (start !== this._previousStart || end !== this._previousEnd) {
            this.update.emit(items.slice(start, end));

            if (start !== this._previousStart && this._startupLoop === false) {
                this.start.emit({ start, end });
            }

            if (end !== this._previousEnd && this._startupLoop === false) {
                this.end.emit({ start, end });
            }

            this._previousStart = start;
            this._previousEnd = end;
            if (this._startupLoop === true) {
                this.refresh();
            } else {
                this.change.emit({
                    start: start,
                    end: end
                });
            }
        } else if (this._startupLoop === true) {
            this._startupLoop = false;
            this.refresh();
        }
    }
    // End of private methods

    // Public methods
    ngOnInit() {
        this._scroll$.switchMap(() => {
            this.refresh();
            return Observable.of();
        }).subscribe();
        this.scrollbarWidth = 0; // this.element.nativeElement.offsetWidth - this.element.nativeElement.clientWidth;
        this.scrollbarHeight = 0; // this.element.nativeElement.offsetHeight - this.element.nativeElement.clientHeight;
    }

    ngOnChanges(changes: SimpleChanges) {
        this._previousStart = undefined;
        this._previousEnd = undefined;
        const items = (changes as any).items || {};
        if ((changes as any).items != undefined && items.previousValue == undefined || items.previousValue.length === 0) {
            this._startupLoop = true;
        }
        this.refresh();
    }

    ngOnDestroy() {
        if (this._onScrollListener !== undefined) {
            // this removes the listener
            this._onScrollListener();
        }
    }

    refresh() {
        requestAnimationFrame(() => this._calculateItems());
    }
    // End of public methods









}
