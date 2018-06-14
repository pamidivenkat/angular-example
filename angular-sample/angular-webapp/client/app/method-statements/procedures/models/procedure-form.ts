import { isNullOrUndefined } from 'util';
import { ProcedureGroup } from '../../../shared/models/proceduregroup';
import { Procedure } from './procedure';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { BehaviorSubject } from 'rxjs/Rx';
import { Context } from 'vm';
import { ValidatorFn, Validators, AbstractControl } from '@angular/forms';
import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper
} from '../../../shared/models/iform-builder-vm';
import * as Immutable from 'immutable';
import { ProcedureService } from "../services/procedure.service";

export class ProcedureForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<ProcedureFieldWrapper<any>> = new Array();
    private _ProcedureObject: Procedure;
    private _canCreateExampleProcedures: boolean;
    private _isAdministrator: boolean;
    private _procedureService: ProcedureService;

    constructor(name: string, procedureObject: Procedure, canCreateExampleProcedures: boolean, procedureService: ProcedureService) {
        this.name = name;
        this._ProcedureObject = procedureObject;
        this._canCreateExampleProcedures = canCreateExampleProcedures;
        this._isAdministrator = canCreateExampleProcedures;
        this._procedureService = procedureService;
    }

    public init(): Array<IFormFieldWrapper<any>> {
        if (this.name == 'procedureForm') {
            this.fieldsArray.push(createFormFieldWrapperObject('Name', '', createFormFieldObject('Name', FormFieldType.InputString, this._ProcedureObject.Name, [Validators.required])));
        }
        if (this.name !== 'procedureForm') {
            this.fieldsArray.push(createFormFieldWrapperObject('Name', '', createFormFieldObject('Name', FormFieldType.InputString, this._ProcedureObject.Name, [Validators.required])));
            this.fieldsArray.push(createFormFieldWrapperObject('Procedure group ', '', createFormFieldObject('ProcedureGroupId', FormFieldType.Select, this._ProcedureObject.ProcedureGroupId, [Validators.required])));
            this.fieldsArray.push(createFormFieldWrapperObject('Description', '', createFormFieldObject('Description', FormFieldType.RichTextEditor, this._ProcedureObject.Description, [])));
            if (this._canCreateExampleProcedures) {
                this._ProcedureObject.IsExample = true;
                this.fieldsArray.push(createFormFieldWrapperObject('Is example', '', createFormFieldObject('IsExample', FormFieldType.Switch, { value: this._ProcedureObject.IsExample, disabled: true }, [Validators.required])));
            }
        }

        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class ProcedureFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class ProcedureField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class ProcedureCommentsContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();

        if (field.name === 'Name') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Enter the procedure name');
        }

        if (field && field.name === 'ProcedureGroupId') {
            this._context.set('required', true);
            this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('placeholder', 'Please select');
        }
        if (field && field.name === 'Description') {
            this._context.set('rows', 5);
            this._context.set('placeholder', 'Enter the procedure description');
        }
        if (field && field.name === 'IsExample') {
            this._context.set('required', true);
        }
    }

    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): ProcedureFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new ProcedureCommentsContext(field),
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): ProcedureField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}

export class ProcedureValidations {
    static procedureName = (procedureService: ProcedureService) => {
        return (control: AbstractControl): { [key: string]: boolean } => {
            let value = control.value ? control.value : null;
            if (!isNullOrUndefined(value)) {
                let val = procedureService.validateProcedureName(value);                
                return { 'procedureName': !val };
            }
            return null;
        };
    }
}



