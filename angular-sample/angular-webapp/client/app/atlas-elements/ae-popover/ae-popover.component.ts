import { AeTemplateComponent } from '../ae-template/ae-template.component';
import { isNullOrUndefined } from 'util';
import { PopoverVm } from '../common/models/popover-vm';
import { BehaviorSubject, Subject, Subscription } from 'rxjs/Rx';
import { BaseElement } from '../common/base-element';
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EmbeddedViewRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
    ViewRef,
    Renderer2
} from '@angular/core';
import { CommonHelpers } from './../../shared/helpers/common-helpers';

@Component({
    selector: 'ae-popover',
    templateUrl: './ae-popover.component.html',
    styleUrls: ['./ae-popover.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class AePopoverComponent extends BaseElement implements OnInit {
    // Private Fields
	/** variable to set the visibility of the popover
	 * @private
	 * @type {boolean}
	 * @memberOf AePopoverComponent
	 */
    private _visibility: boolean = false;
    private _visibleChange: Subject<PopoverVm<any>>;
    private _visibleChangeSubscription: Subscription;
    private _vm: PopoverVm<any>;
    private _top: number;
    private _left: number;
    private _arrowLeft: number;
    private _headerHeight: string;
    private _show: string = 'hidden';
    private _previousElement: ElementRef;
    private _context: any;
    private _viewRef;
    //End of Private Fields

    // Public Properties

    get visibility(): boolean {
        return this._visibility;
    }

    get show(): string {
        return this._show;
    }

    get top(): number {
        return this._top;
    }

    get left(): number {
        return this._left;
    }
    get arrowLeft(): number {
        return this._arrowLeft;
    }
	/**
	 * visible change out put emitter.
	 * @type {EventEmitter<boolean>}
	 * @memberOf AePopoverComponent
	 */

    @Input('visibleChange')
    set visibleChange(val: Subject<PopoverVm<any>>) {
        this._visibleChange = val;
    }
    get visibleChange() {
        return this._visibleChange;
    }

    //End of Public Properties

    //Public Output Bindings

    //End of Public Output Bindings

    // Public ViewChild bindings
    @ViewChild('toolTipTemplate')
    _toolTipTemplate: AeTemplateComponent<any>
    // End of Public ViewChild bindings

    // Public ViewContent bindings
    //End Public ViewContent bindings

    // Constructor
    constructor(private _elementRef: ElementRef, private _cdr: ChangeDetectorRef, private _renderer: Renderer2) {
        super();
    }
    // End of constructor

    // Private methods
	/**
	 * closes the pop over
	 * @memberOf AePopoverComponent
	 */
    private _close(): void {
        this._visibleChangeSubscription.unsubscribe();
        this._visibility = false;
        this._subscribeVisibleChange();
    }

    private _subscribeVisibleChange(): void {
        this._visibleChangeSubscription = this._visibleChange.subscribe((vm: PopoverVm<any>) => {
            if (!isNullOrUndefined(vm)) {
                this._vm = vm;
                let sourceElement = this._vm.sourceElement.nativeElement;
                if (this._vm.isToolTip) {
                    this._vm.template = this._toolTipTemplate;
                }
                if (isNullOrUndefined(this._context) || this._context.Text !== this._vm.context) {
                    this._context = Object.create(this._vm.context);
                } else {
                    this._updateContext();
                }
                if (!isNullOrUndefined(sourceElement)) {
                    let boundingRect = sourceElement.getBoundingClientRect();
                    this._top = ((boundingRect.top - 80) + window.pageYOffset) + (boundingRect.height / 2) + 15;
                    this._left = boundingRect.left - (boundingRect.width / 2);
                    this._arrowLeft = boundingRect.left;
                    if (isNullOrUndefined(this._previousElement) || this._previousElement === this._vm.sourceElement) {
                        this._visibility = !this._visibility;
                    }
                    else {
                        this._changePosition(this._viewRef);
                    }
                    this._show = "hidden";
                } else {
                    this._visibility = false;
                }
                if (this._visibility) {
                    this._previousElement = this._vm.sourceElement;
                } else {
                    this._previousElement = null;
                }
            } else {
                this._visibility = false;
                this._previousElement = null;
            }

        });
    }

    getPopOverContext() {
        return this._context;
    }

    getPopOverTemplate() {
        return this._vm.template.template;
    }

    private _updateContext() {
        for (let key in this._context) {
            this._context[key] = null;
        }
        for (let key in this._context) {
            this._context[key] = this._vm.context[key];
        }
    }

    isTemplated(): boolean {
        return !isNullOrUndefined(this._vm) && !isNullOrUndefined(this._vm.template);
    }

    isToolTip(): boolean {
        return this._vm.isToolTip;
    }

    onPopOverCreated(viewRef) {
        this._viewRef = viewRef;
        this._changePosition(viewRef);
    }

    private _changePosition(viewRef) {
        setTimeout(() => {
            let ele = viewRef.rootNodes[0].parentNode;
            let sourceEleRect = this._vm.sourceElement.nativeElement.getBoundingClientRect();
            this._left = sourceEleRect.left + (sourceEleRect.width - ele.clientWidth) / 2;
            this._arrowLeft = (sourceEleRect.left - this._left) + sourceEleRect.width / 2;
            if (this._left < 0) {
                this._left = 1;
                this._arrowLeft = sourceEleRect.left + (sourceEleRect.width / 2);
            }
            this._show = "visible";
            this._cdr.markForCheck();
        }, 10);
    }

    // End of private methods

    // Public methods
    ngOnInit() {
        super.ngOnInit();
        this._subscribeVisibleChange();
        this._renderer.listen('document', 'click', (event: MouseEvent) => {
            if (this._visibility) {
                this._visibility = false;
                this._cdr.markForCheck();
                this._previousElement = null;
            }
        });
    }
    // End of public methods
}