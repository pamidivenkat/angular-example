import { Subscription } from 'rxjs/Rx';
import { AeITemplateItem } from '../common/models/ae-itemplate-item.model';
import { isNullOrUndefined } from 'util';
import { isObject } from 'rxjs/util/isObject';
import { BehaviorSubject, Subject } from 'rxjs/Rx';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EmbeddedViewRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    TemplateRef,
    ViewContainerRef,
    OnDestroy
} from '@angular/core';

@Component({
    selector: 'ae-template-loader',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeTemplateLoaderComponent<T> implements OnInit, OnDestroy {

    // Private Fields
    private _template: TemplateRef<any>;
    private _templateStream: BehaviorSubject<TemplateRef<any>>;
    private _templateItemStream: BehaviorSubject<AeITemplateItem<T>>;
    private _contextItem: T;
    private _viewRef: EmbeddedViewRef<any>;
    private _contextItemStream: BehaviorSubject<T>;
    private _isMultiple: boolean;
    private _contextItemStreamSubscription: Subscription;
    private _templateStreamSubscription: Subscription;
    private _templateItemStreamSubscription: Subscription;
    // End of Private Fields

    // Public properties
    @Input('template')
    get template() {
        return this._template;
    }
    set template(val: TemplateRef<any>) {
        this._template = val;
    }

    @Input('templateStream')
    get templateStream() {
        return this._templateStream;
    }
    set templateStream(val: BehaviorSubject<TemplateRef<any>>) {
        if (isNullOrUndefined(this._templateStream) && isNullOrUndefined(this._templateStreamSubscription)) {
            this._templateStream = val;
            this._templateStreamSubscription = this._templateStream.subscribe((nextTemplate) => {
                if (this._isMultiple) {

                } else {
                    if (!isNullOrUndefined(nextTemplate)) {
                        this._replaceWithOutContext(nextTemplate);
                    }
                }
            });
        }
    }

    @Input('templateItemStream')
    get templateItemStream() {
        return this._templateItemStream;
    }
    set templateItemStream(val: BehaviorSubject<AeITemplateItem<T>>) {
        if (isNullOrUndefined(this._templateItemStream) && isNullOrUndefined(this._templateItemStreamSubscription)) {
            this._templateItemStream = val;
            this._templateItemStreamSubscription = this._templateItemStream.subscribe((nextTemplateItem) => {
                if (this._isMultiple) {

                }
                else {
                    if (!isNullOrUndefined(nextTemplateItem)) {
                        this._replaceWithContext(nextTemplateItem.template, nextTemplateItem.context);
                    }
                }
            });
        }
    }

    @Input('contextItemStream')
    set contextItemStream(val: BehaviorSubject<T>) {
        if (isNullOrUndefined(this._contextItemStream) && isNullOrUndefined(this._contextItemStreamSubscription)) {
            this._contextItemStream = val;
            this._contextItemStreamSubscription = this._contextItemStream.subscribe((nextValue) => {
                if (!isNullOrUndefined(nextValue)) {
                    if (isObject(this._contextItem)) {
                        Object.keys(this._contextItem).forEach((key) => {
                            if (this._contextItem[key] !== nextValue[key]) {
                                this._contextItem[key] = nextValue[key];
                            }
                        });
                    }
                    else {
                        this._contextItem = nextValue;
                    }
                }

            });
        }
    }
    get contextItemStream() {
        return this._contextItemStream;
    }
   

    @Input('contextItem')
    get contextItem() {
        return this._contextItem;
    }
    set contextItem(val: T) {
        this._contextItem = val;
    }

    //@Input
    // End of Public properties

    // Public Output bindings
    @Output()
    public onElementCreated: EventEmitter<EmbeddedViewRef<any>> = new EventEmitter<EmbeddedViewRef<any>>();
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ViewContent bindings
    // End of Public ViewContent bindings

    // Constructor
    constructor(private _viewContainerRef: ViewContainerRef) { }
    // End of constructor

    // Private methods
    private _replace(templ: TemplateRef<any>, context: T) {
        this._viewContainerRef.clear();
        if (isNullOrUndefined(context)) {
            this._viewRef = this._viewContainerRef.createEmbeddedView(templ, { "item": this._contextItem });
        }
        else {
            this._viewRef = this._viewContainerRef.createEmbeddedView(templ, { "item": context });
        }
    }
    private _replaceWithOutContext(templ: TemplateRef<any>): void {
        this._replace(templ, null);
    }

    private _replaceWithContext(templ: TemplateRef<any>, context: T) {
        this._replace(templ, context);
    }

    private _add(templ: TemplateRef<any>, context: T, last: boolean, first: boolean, index: number) {

    }

    private _addWithOutContext(templ: TemplateRef<any>, last: boolean, first: boolean, index: number): void {

    }

    private _addWithContext(templ: TemplateRef<any>, context: T, last: boolean, first: boolean, index: number): void {

    }
    // End of private methods

    // Public methods
    ngOnInit(): void {
        if (!isNullOrUndefined(this._template)) {
            this._viewRef = this._viewContainerRef.createEmbeddedView(this._template, { "item": this._contextItem });
            this.onElementCreated.emit(this._viewRef);
        }
    }
    ngOnDestroy(): void {
        if (this.onElementCreated) {
            this.onElementCreated.unsubscribe();
        }
        if (this._templateStreamSubscription) {
            this._templateStreamSubscription.unsubscribe();
        }
        if (this._templateItemStreamSubscription) {
            this._templateItemStreamSubscription.unsubscribe();
        }
        if (this._contextItemStreamSubscription) {
            this._contextItemStreamSubscription.unsubscribe();
        }
    }
    // End of public methods

}
