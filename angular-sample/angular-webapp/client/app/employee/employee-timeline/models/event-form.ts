import { ObjectHelper } from '../../../shared/helpers/object-helper';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { BehaviorSubject, Subject } from 'rxjs/Rx';
import { FormHelper } from '../../../shared/helpers/form-helper';
import { debug, isNullOrUndefined } from 'util';
import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper
} from '../../../shared/models/iform-builder-vm';
import * as Immutable from 'immutable';
import { ValidatorFn } from "@angular/forms";
import { Validators } from '@angular/forms';

export class EventForm implements IFormBuilderVM {
    public name: string;
    private _filedArray: Array<IFormFieldWrapper<any>> = new Array();
    private _formTemplate: Array<UIField>;
    constructor(formName: string, formTemplate: string) {
        this.name = formName;
        this._formTemplate = <Array<UIField>>(JSON.parse(formTemplate));
    }

    getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this._filedArray);
    }

    init(): Array<IFormFieldWrapper<any>> {
        if (!isNullOrUndefined(this._formTemplate)) {
            this._formTemplate.forEach(field => {
                this._filedArray.push(createFormFieldWrapperObject(field.displayText, "", createFormFieldObject(field.name, FormHelper.getFieldType(field.displayType), "", this._getValidators(field)), this._getContextData(field)));
            });
        } else {
            this._filedArray = new Array();
        }
        return this._filedArray;
    }

    getFormTemplate(): Array<UIField> {
        return this._formTemplate;
    }

    _getContextData(field: UIField): Map<string, any> {
        let data: Map<string, any> = new Map<string, any>();
        if (field.required) {
            data.set('required', field.required);
        }
        if (field.disabled) {
            data.set('disabled', field.disabled);
        }

        if (!isNullOrUndefined(field.depends)) {
            for (let key in field.depends) {
                if (key === 'disableField') {
                    data.set('disableFieldValue', new BehaviorSubject<any>(true));
                }
                if (key === 'visibility') {
                    data.set('property', key);
                    data.set('propertyValue', new BehaviorSubject<any>(false));
                }

            }
        }
        if (field.name.toLowerCase().indexOf('date') > 0) {
            data.set('placeholder', "dd/mm/yyyy");
        } else {
            let nameOfField = field.name;
            if (field.name === 'ActionNotes') {
                nameOfField = 'Notes';//in UI its labelled as Notes
            }
            var re = /[\s_]+|([a-z0-9])(?=[A-Z])/g;
            let convertedStr = nameOfField.replace(re, "$1 ").toLowerCase(); // convert camel casing to words separated by space
            convertedStr = convertedStr.charAt(0).toUpperCase() + convertedStr.slice(1);
            data.set('placeholder', convertedStr);
        }

        if (field.name === 'AppealOutcome') {
            data.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<string>>([])));
            data.set('placeholder', 'Please select');
        }

        //Disciplinary Outcome
        if (field.name === 'DisciplinaryOutcome') {
            data.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<string>>([])));
            data.set('placeholder', 'Please select');
        }

        //Outcome
        if (field.name === 'Outcome') {
            data.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<string>>([])));
            data.set('placeholder', 'Please select');
        }

        //ReviewType
        if (field.name === 'ReviewType') {
            data.set('options', new BehaviorSubject(Immutable.List<any>([])));
            data.set('placeholder', 'Please select');
        }

        if (field.name === 'GrievanceOutcome') {
            data.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<string>>([])));
            data.set('placeholder', 'Please select');
        }
        if (field.name === 'ReasonForLeaving') {
            data.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<string>>([])));
            data.set('placeholder', 'Please select');
        }

        if (field.name === 'SubReason') {
            data.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<string>>([])));
            data.set('placeholder', 'Please select');
        }
        if (field.name === 'CertificateReceivedDate'
            || field.name === 'ConfidentialitySignedDate'
            || field.name === 'InterviewHeldDate') {
            data.set('hideLabelText', true);
        }
        return data;
    }

    _getValidators(field: UIField): Array<any> {
        let validators = new Array<any>();
        if (field.required) {
            validators.push(Validators.required);
        }
        return validators;
    }
}


function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>, data: Map<string, any>): IFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new EventFormFieldContext(data)
    }
}

function createFormFieldObject<T>(name: string,
    type: FormFieldType,
    initialValue: T,
    validators: ValidatorFn | ValidatorFn[]): IFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}

export class UIField {
    name: string;
    displayType: FormFieldType;
    displayText: string;
    required: boolean;
    disabled: boolean;
    depends: Map<string, DependsUIField>;
}

export class DependsUIField {
    field: string;
    props: Array<Props>;
    condition: string;
}

export class Props {
    prop: string;
    propVal: any;
    equality: string;
    condition: string;
}
export class EventFormFieldContext implements IFormFieldContext {
    private _data: Map<string, any>;
    constructor(data: Map<string, any>) {
        this._data = data;
    }
    public getContextData(): Map<string, any> {
        return this._data;
    }
}