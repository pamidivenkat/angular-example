import { AeTabstripItem } from '../common/models/ae-tabstrip-item';
import { AeNav } from '../common/ae-nav.enum';
import {
    AfterViewInit,
    Component,
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewContainerRef
} from '@angular/core';
// import { AeTabstripComponent } from '../ae-tabstrip/ae-tabstrip.component';

// export type ScrollDirection = 'backward' | 'forward';

@Directive({
    selector: '[ae-scroll]',
    exportAs: 'AeScroll'
})
export class AeScrollDirective {
    // Private Fields
    /**
       *  variable to hold how much distance scrolled from the viewport width
       * @private
       * @memberOf AeTabstripComponent
       */
    private _scrollDistance = 0;

    /**
     *  variable to hold tab item width
     * @private
     * @type {number}
     * @memberOf AeScrollDirective
     */
    private _tabItemWidth: number = 220;

    /**
     * variable to hold scroll items count 
     * @private
     * @type {number}
     * @memberOf AeScrollDirective
     */
    private _scrollItemsCount: number = 4;
    // End of Private Fields

    // Public properties
    /**
     *  tab item width property with getter and setter
     * @readonly
     * 
     * @memberOf AeScrollDirective
     */
    @Input('tabItemWidth')
    get tabItemWidth() {
        return this._tabItemWidth;
    }
    set tabItemWidth(_tabItemWidth: number) {
        this._tabItemWidth = _tabItemWidth;
    }

    /**
     * scroll items count property with getter and setter
     * @readonly
     * 
     * @memberOf AeScrollDirective
     */
    @Input('scrollItemsCount')
    get scrollItemsCount() {
        return this._scrollItemsCount;
    }
    set scrollItemsCount(_scrollItemsCount: number) {
        this._scrollItemsCount = _scrollItemsCount;
    }
    // End of Public properties

    // Public Output bindings
    /**
     * output emitter for show/hide of next navigation link
     * @type {EventEmitter<boolean>}
     * @memberOf AeScrollDirective
     */
    @Output() OnactiveNextNavChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**
   * output emitter for show/hide of previous navigation link
   * @type {EventEmitter<boolean>}
   * @memberOf AeScrollDirective
   */
    @Output() OnactivePrevNavChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ViewContent bindings
    // End of Public ViewContent bidnings

    // constructor
    constructor(private _tabList: ElementRef) { }
    // End of constructor

    // Private methods
    // End of private methods

    // Public methods
    /*
   * moves backward when scrollable items 
   * 
   * @memberOf AeTabstripComponent
   */
    moveBackward(scrollDirection: AeNav) {
        this.updateTabScrollPosition(scrollDirection);
        //this.showNavLinkOnEnter(this.selectedTabItem, scrollDirection);
    }

    /**
     * moves forward when scrollable items 
     * @memberOf AeTabstripComponent
     */
    moveForward(scrollDirection: AeNav) {
        this.updateTabScrollPosition(scrollDirection);
        //this.showNavLinkOnEnter(this.selectedTabItem, scrollDirection);
    }

    /**
     *  shows the backward scroll or forward scroll link based on the tab item mouse enter  event
     * @param {AeTabstripItem} tab 
     * @memberOf AeTabstripComponent
     */
    showNavLinkOnEnter(tabIndex: number, scrollDirection: AeNav) {
        let maxScrollDistance = this.getMaxScrollDistance();
        let totalTabsHiddenForward: number = Math.floor(maxScrollDistance / this.tabItemWidth);
        let totalTabsShiftedForward: number = Math.floor(Math.abs(this._scrollDistance / this.tabItemWidth));
        if (scrollDirection == AeNav.Forward && (totalTabsShiftedForward == totalTabsHiddenForward)) {
            let activeNextNav = false;
            this.OnactiveNextNavChange.emit(activeNextNav);
            return;
        }
        if (scrollDirection === AeNav.Backward && totalTabsShiftedForward == 0) {
            let activePrevNav = false;
            this.OnactivePrevNavChange.emit(activePrevNav);
            return;
        }
        let totalItemsCount = (this._tabList.nativeElement.offsetWidth / this.tabItemWidth)
        let isLastItemInView = tabIndex != totalItemsCount && (tabIndex - totalTabsShiftedForward) == (totalItemsCount - totalTabsHiddenForward);
        if (isLastItemInView) {
            let activeNextNav = true;
            this.OnactiveNextNavChange.emit(activeNextNav);
        }
        else if (totalTabsShiftedForward > 0 && tabIndex == totalTabsShiftedForward + 1) {
            let activePrevNav = true;
            this.OnactivePrevNavChange.emit(activePrevNav);
        }

    }

    /**
      * returns the max scroll distance can animate
      * @returns {number} 
      * @memberOf AeTabstripComponent
      */
    getMaxScrollDistance(): number {
        let lengthOfTabList = this._tabList.nativeElement.offsetWidth;
        let viewLength = 0;
        if (this._tabList.nativeElement.offsetParent)
            viewLength = this._tabList.nativeElement.offsetParent.offsetWidth;
        return lengthOfTabList - viewLength;
    }

    /**
       *  method to calculate to scroll distance to be moved
       * @param {boolean} moveForward 
       * 
       * @memberOf AeTabstripComponent
       */
    scrollHeader(scrollDirection: AeNav) {
        let moveForward = scrollDirection == AeNav.Forward;
        var moveWidth = moveForward ? -(this._scrollItemsCount * this.tabItemWidth) : (this._scrollItemsCount * this.tabItemWidth);
        var maxScrollDistance = this.getMaxScrollDistance();
        var canMaxScrollWidth = this._scrollDistance + moveWidth
        if (moveForward) {

            if (Math.abs(canMaxScrollWidth) <= maxScrollDistance)
                this._scrollDistance = canMaxScrollWidth;
            else
                this._scrollDistance = -maxScrollDistance;
        }
        else {
            if (canMaxScrollWidth < 0)
                this._scrollDistance = canMaxScrollWidth;
            else
                this._scrollDistance = 0;
        }
    }

    /**
   * updates the tab scroll position 
   * @param {boolean} moveForward 
   * @memberOf AeTabstripComponent
   */
    updateTabScrollPosition(scrollDirection: AeNav) {
        this.scrollHeader(scrollDirection);
        let translateX = this._scrollDistance + 'px';
        this.applyCssTransform(this._tabList.nativeElement, `translate3d(${translateX}, 0, 0)`);
        this.hideOnIfLastItem();
    }

    /**
     * hides navigation link if the list scroll to first element or last
     * @memberOf AeScrollDirective
     */
    hideOnIfLastItem() {
        var totalDistanceMoved = this._scrollDistance + this._tabList.nativeElement.offsetWidth;
        let viewLength = 0;
        if (this._tabList.nativeElement.offsetParent)
            viewLength = this._tabList.nativeElement.offsetParent.offsetWidth;
        if (this._scrollDistance == 0) {
            this.OnactivePrevNavChange.emit(false);
        }
        if (totalDistanceMoved == viewLength) {
            this.OnactiveNextNavChange.emit(false);
        }
    }

    /**
     *  method to transform element based on the scroll position set
     * @param {HTMLElement} element 
     * @param {string} transformValue 
     * @memberOf AeTabstripComponent
     */
    applyCssTransform(element: HTMLElement, transformValue: string) {
        let value = transformValue.trim();
        element.style.animation = "0.3s 0.1s ease";
        element.style.animation
        element.style.transform = value;
        element.style.webkitTransform = value;
    }
    // End of public methods
}