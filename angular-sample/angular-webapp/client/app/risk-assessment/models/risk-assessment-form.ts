import { ValidatorFn, Validators } from '@angular/forms';
import { TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { BehaviorSubject } from 'rxjs/Rx';

import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper,
} from '../../shared/models/iform-builder-vm';

export class RiskAssessmentForm implements IFormBuilderVM {
    public name: string;
    private _isExample: boolean;
    private _isMigrated: boolean;
    public fieldsArray: Array<RiskAssessmentFormFieldWrapper<any>> = new Array();

    constructor(name: string, example: boolean, migrated: boolean = false) {
        this.name = name;
        this._isExample = example;
        this._isMigrated = migrated
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Assessment type', '', createFormFieldObject('RiskAssessmentTypeId', FormFieldType.Select, '', [Validators.required]), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Assessment name', '', createFormFieldObject('Name', FormFieldType.InputString, '', [Validators.required, Validators.maxLength(250)]), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject(this._isMigrated ? 'Description/Identified hazard' : 'Description', '', createFormFieldObject('Description', FormFieldType.TextArea, '', []), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Assessor', '', createFormFieldObject('AssessorId', FormFieldType.Select, '', [Validators.required]), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Assessor', '', createFormFieldObject('Assessor_Name', FormFieldType.InputString, '', [Validators.required]), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Who is at risk?', '', createFormFieldObject('Mig_WhoIsAtRisk', FormFieldType.TextArea, '', []), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('How is the risk controlled?', '', createFormFieldObject('Mig_HowRiskControlled', FormFieldType.TextArea, '', []), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Area of business', '', createFormFieldObject('BusinessArea', FormFieldType.InputString, '', []), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Reference', '', createFormFieldObject('ReferenceNumber', FormFieldType.InputString, '', this._isExample ? [Validators.required] : []), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Affected site locations', '', createFormFieldObject('SiteId', FormFieldType.Select, '', [Validators.required]), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Add affected site locations', '', createFormFieldObject('SiteLocation', FormFieldType.InputString, '', [Validators.required]), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Assessment date', '', createFormFieldObject('AssessmentDate', FormFieldType.Date, '', [Validators.required]), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Review period', '', createFormFieldObject('ReviewPeriod', FormFieldType.Select, '', []), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Review date', '', createFormFieldObject('ReviewDate', FormFieldType.Date, '', []), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Review date', '', createFormFieldObject('ReviewDateDisplay', FormFieldType.DisplayValue, '', []), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Print employee acknowledgement?', '', createFormFieldObject('HasAcknowledgement', FormFieldType.Switch, '', []), this._isExample));
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class RiskAssessmentFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class RiskAssessmentFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class RiskAssessmentFormContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>, example: boolean) {
        this._context = new Map<string, any>();
        if (field.name === 'Name') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Assessment name');
            this._context.set('maxlength', 250);
        }
        if (field.name === 'RiskAssessmentTypeId') {
            this._context.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('showInfoIcon', true);
            this._context.set('infoText', 'Select whether this is going to be a COSHH or general assessment. This is important as COSHH assessments contain additional tabs for applicable information.');
        }
        if (field.name === 'SiteId') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
            this._context.set('showInfoIcon', true);
            this._context.set('infoText', 'The location should be wherever you are assessing. If you\'ll be using the same assessment for different locations you can select New Site and type Multiple Locations in the text box.');
        }

        if (field.name === 'SiteLocation') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Affected site location');
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));

        }
        if (field.name === 'ReviewPeriod') {
            this._context.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<number>>([])));
            this._context.set('showInfoIcon', true);
            this._context.set('infoText', 'Enter the frequency that this assessment needs to be reviewed. Typically this is annually but a review may be required sooner in the event of a significant change, such as change to the activity/task, following a serious accident, injury or near miss.')
        }

        if (field.name === 'AssessorId') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
            this._context.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<string>>([])));
        }

        if (field.name === 'Assessor_Name') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Assessor name');
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }
        if (field.name === 'ReferenceNumber') {
            this._context.set('required', example);
            this._context.set('placeholder', 'Reference number');
        }
        if (field.name === 'BusinessArea') {
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }
        if (field.name === 'AssessmentDate') {
            this._context.set('required', !example);
            this._context.set('property', 'visibility');
            this._context.set('minDate', new Date());
            this._context.set('readonlyInput', true);
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'ReviewDate') {
            this._context.set('property', 'visibility');
            this._context.set('minDate', new Date());
            this._context.set('readonlyInput', true);
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'ReviewDateDisplay') {
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
            this._context.set('displayValue', new BehaviorSubject<string>(null));
        }

        if (field.name === 'Mig_WhoIsAtRisk') {
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }
        if (field.name === 'Mig_HowRiskControlled') {
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }
        if (field.name === 'HasAcknowledgement') {
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>, example: boolean): RiskAssessmentFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new RiskAssessmentFormContext(field, example)
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): RiskAssessmentFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}
