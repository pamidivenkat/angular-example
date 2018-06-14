import { NavigationExtras, Router } from '@angular/router';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    ViewEncapsulation,
} from '@angular/core';
import * as Immutable from 'immutable';
import { BehaviorSubject, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeClassStyle } from '../common/ae-class-style.enum';
import { AeITemplateItem } from '../common/models/ae-itemplate-item.model';
import { AeTemplateComponent } from './../ae-template/ae-template.component';
import { BaseElement } from './../common/base-element';
import { AeWizardStep } from './../common/models/ae-wizard-step';

@Component({
    selector: 'ae-wizard',
    templateUrl: './ae-wizard.component.html',
    styleUrls: ['./ae-wizard.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AeWizardComponent extends BaseElement implements OnInit, OnDestroy, AfterContentInit {
    // Private Fields
    private _steps$: BehaviorSubject<Immutable.List<AeWizardStep>>;
    private _steps$Sub: Subscription;
    private _steps: Immutable.List<AeWizardStep>;
    private _activeStepIndex: number = 0;
    private _templateItemStream: BehaviorSubject<AeITemplateItem<any>>;
    private _currentStepValidity: boolean = false;
    private _currentTemplateItem: AeITemplateItem<any>;
    private _lightClass: AeClassStyle = AeClassStyle.Light;
    private _showComplete: boolean = true;
    private _completeButtonText: string = 'Done';
    private _hideFooter: boolean = false;
    private _canNavigateFn: (step: AeWizardStep) => boolean;
    private _previousURL: string;
    private _nextStepIndex: number = -1;
    private _previousBtnClicked: boolean = false;
    private _goToLandingPage: boolean = false;
    private _submitOnStepChange: boolean = true; 
    // End of Private Fields

    // Public properties
    get wizSteps(): Immutable.List<AeWizardStep> {
        return this._steps;
    }

    get activeStepIndex(): number {
        return this._activeStepIndex;
    }

    get lightClass(): AeClassStyle {
        return this._lightClass;
    }

    get templateItemStream(): BehaviorSubject<AeITemplateItem<any>> {
        return this._templateItemStream;
    }

    get isCurrentStepValid() {
        return this._currentStepValidity;
    }

    @Input('steps')
    get steps() {
        return this._steps$;
    }
    set steps(value: BehaviorSubject<Immutable.List<any>>) {
        this._steps$ = value;
    }

    @Input('previousURL')
    get previousURL() {
        return this._previousURL;
    }
    set previousURL(value: string) {
        this._previousURL = value;
    }



    @Input('showComplete')
    get showComplete() {
        return this._showComplete;
    }
    set showComplete(value: boolean) {
        this._showComplete = value;
    }

    @Input('completeButtonText')
    get completeButtonText() {
        return this._completeButtonText;
    }
    set completeButtonText(value: string) {
        this._completeButtonText = value;
    }

    @Input('hideFooter')
    get hideFooter() {
        return this._hideFooter;
    }
    set hideFooter(value: boolean) {
        this._hideFooter = value;
    }

    @Input('canNavigate')
    get canNavigate() {
        return this._canNavigateFn;
    }
    set canNavigate(fn: (step: AeWizardStep) => boolean) {
        this._canNavigateFn = fn;
    }

    // End of Public properties

    // Public Output bindings
    // @Output()
    // onStepChanged: EventEmitter<AeWizardStepComponent> = new EventEmitter<AeWizardStepComponent>();
    @Output('completed')
    completed: EventEmitter<boolean> = new EventEmitter();
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ConntentChild bindings
    @ContentChildren(AeTemplateComponent)
    templates: QueryList<AeTemplateComponent<any>>;
    // End of Public ConntentChild bindings

    // Constructor
    constructor(private _cdRef: ChangeDetectorRef, private _router: Router) {
        super();
    }
    // End of constructor

    // Private methods
    private _getTemplate() {
        return this.templates.find(p => p.type === this.activeStep().templateType).template;
    }

    private _getContext() {
        let contextObj = Object.create(this.activeStep());
        let isValidEvent = new EventEmitter<boolean>();
        isValidEvent.subscribe((val) => {
            this._currentStepValidity = val;
        });
        let submitEvent = new BehaviorSubject<boolean>(false);
        contextObj['isValidEvent'] = isValidEvent;
        contextObj['submitEvent'] = submitEvent;
        if (this.activeStep().waitOnSubmit) {
            let waitOnSubmitEvent = new BehaviorSubject<boolean>(false);
            let clearEvent = new BehaviorSubject<boolean>(false);
            waitOnSubmitEvent.subscribe(val => {
                if (val === true) {
                    if (this._previousBtnClicked) {
                        this.previous(false, true);
                    }
                    else if (this._goToLandingPage) {
                        this.gotoLandingPage(false, true);
                    }
                    else {
                        this.next(false, true);
                    }
                    this._cdRef.markForCheck();
                }
            });
            clearEvent.subscribe(val => {
                if (val === true) {
                    this._previousBtnClicked = false;
                    this._goToLandingPage = false;
                    this._nextStepIndex = -1;
                }
            });
            contextObj['waitEvent'] = waitOnSubmitEvent;
            contextObj['clearEvent'] = clearEvent;

        }
        return contextObj;
    }

    private _loadTemplate(): void {
        this._currentStepValidity = this.activeStep().isAlwaysValid;
        this._currentTemplateItem = {
            template: this._getTemplate(),
            context: this._getContext(),
            last: false,
            first: false,
            index: 0
        }

        this._templateItemStream.next(this._currentTemplateItem);
    }

    // End of private methods

    // Public methods
    private _canNavigate(step: AeWizardStep) {
        if (!isNullOrUndefined(this._canNavigateFn)) {
            return this._canNavigateFn(step);
        } else {
            return true;
        }
    }
    // End of private methods

    // Public methods
    complete() {
        this._currentTemplateItem.context.submitEvent.next(true);
        if (this.completed.observers.length > 0) {
            this.completed.emit(true);
        }
    }

    mouseDownWizget(event) {
        event.preventDefault();
    }

    activeStep(): AeWizardStep {
        return this._steps.get(this._activeStepIndex);
    }

    goToStep(step: AeWizardStep, isSubmit: boolean = true, skipValidity: boolean = false) {
        
        if (isSubmit && this.activeStep().waitOnSubmit) {
            this._nextStepIndex = this._steps.findIndex(p => p.templateType === step.templateType);
            this._currentTemplateItem.context.submitEvent.next(isSubmit);
            this._submitOnStepChange = step.submitOnStepChange;
            return;
        }
        if ((this._currentStepValidity || skipValidity) && this._canNavigate(step)) {
            this._activeStepIndex = this._steps.findIndex(p => p.templateType === step.templateType);
            if (isSubmit && this._submitOnStepChange) {
                this._currentTemplateItem.context.submitEvent.next(isSubmit);
            }
            this._submitOnStepChange = step.submitOnStepChange;
            this._loadTemplate();
        }
        
    }

    hasNextStep(): boolean {
        return this._activeStepIndex < this._steps.count() - 1;
    }

    hasPrevStep(): boolean {
        return this._activeStepIndex > 0;
    }

    next(submit: boolean = true, waitCompleted: boolean = false) {
        let continueToNextStep = !this.activeStep().waitOnSubmit || waitCompleted;
        if (continueToNextStep) {
            if (this.hasNextStep()) {
                this._activeStepIndex = this._nextStepIndex != -1 ? this._nextStepIndex : this._activeStepIndex + 1;
                this._nextStepIndex = -1;
            }
            this._currentTemplateItem.context.submitEvent.next(submit);
            this._loadTemplate();
            window.scrollTo(0, 0);
        }
        else {
            this._currentTemplateItem.context.submitEvent.next(submit);
        }
        this._submitOnStepChange = this.activeStep().submitOnStepChange;
    }

    previous(submit: boolean = true, waitCompleted: boolean = false) {
        this._previousBtnClicked = true;
        let continueToNextStep = !this.activeStep().waitOnSubmit || waitCompleted;
        if (continueToNextStep) {
            if (this.hasPrevStep()) {
                this._activeStepIndex = this._activeStepIndex - 1;
            }
            if (this.activeStep().submitOnPrevious) {
                this._currentTemplateItem.context.submitEvent.next(submit);
            }
            this._loadTemplate();
            window.scrollTo(0, 0);
            this._previousBtnClicked = false;
        }
        else {
            this._currentTemplateItem.context.submitEvent.next(submit);
        }
        this._submitOnStepChange = this.activeStep().submitOnStepChange;
    }

    gotoLandingPage(submit: boolean = true, waitCompleted: boolean = false) {
        this._goToLandingPage = true;
        let continueToNextStep = !this.activeStep().waitOnSubmit || waitCompleted;
        if (continueToNextStep) {
            this._goToPreviousPage();
        }
        else {
            if (this.activeStep().submitOnPrevious) {
                this._currentTemplateItem.context.submitEvent.next(submit);
            }
            else {
                this._goToPreviousPage();

            }
        }
    }

    private _goToPreviousPage() {
        this._goToLandingPage = false;
        if (isNullOrUndefined(this._previousURL)) return;

        let navigationExtras: NavigationExtras = {
            queryParamsHandling: 'merge'
        };

        this._router.navigate([this._previousURL], navigationExtras);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this._templateItemStream = new BehaviorSubject<AeITemplateItem<any>>(null);
        this._steps$Sub = this._steps$.subscribe((value) => {
            if (value.count() > 0) {
                this._steps = value.filter(p => !p.hidden).toList();
                this._activeStepIndex = this._steps.findIndex(p => p.isActive);
                if (this._activeStepIndex === -1) {
                    this._activeStepIndex = 0;
                };
                this._submitOnStepChange = this.activeStep().submitOnStepChange;
                if (!isNullOrUndefined(this.templates)) {
                    this._loadTemplate();
                }

                this._cdRef.markForCheck();
            }
        });
    }

    ngOnDestroy(): void {
        this._steps$Sub.unsubscribe();
    }

    ngAfterContentInit(): void {
        this._loadTemplate();
    }
    // End of public methods
}