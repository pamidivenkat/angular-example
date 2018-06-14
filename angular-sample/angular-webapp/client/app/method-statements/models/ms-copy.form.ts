import { CommonValidators } from './../../shared/validators/common-validators';
import { AeSelectItem } from './../../atlas-elements/common/models/ae-select-item';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { MethodStatement } from './method-statement';
import { FormFieldType, IFormBuilderVM, IFormFieldWrapper, IFormFieldContext, IFormField } from './../../shared/models/iform-builder-vm';
import * as Immutable from 'immutable';
import { Context } from 'vm';
import { ValidatorFn, Validators } from '@angular/forms';
import { AeDatasourceType } from "./../../atlas-elements/common/ae-datasource-type";

export class MethodStatementCopyForm implements IFormBuilderVM {

    public name: string;
    public fieldsArray: Array<MethodStatementCopyFormieldWrapper<any>> = new Array();
    public methodStatement: MethodStatement;
    public isAdmin: boolean;
    public showCompanyDropdown: boolean;

    constructor(name: string, model: MethodStatement, isAdmin: boolean, showCompanyDropdown: boolean) {
        this.name = name;
        this.methodStatement = model;
        this.isAdmin = isAdmin;
        this.showCompanyDropdown = showCompanyDropdown;
    }
    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Method statement name', '', createFormFieldObject('Name', FormFieldType.InputString, this.methodStatement.Name, [Validators.required])));
        if (!this.isAdmin) {
            this.fieldsArray.push(createFormFieldWrapperObject('Start date', '', createFormFieldObject('StartDate', FormFieldType.Date, this.methodStatement.StartDate == null ? null : new Date(this.methodStatement.StartDate), [Validators.required])));
            this.fieldsArray.push(createFormFieldWrapperObject('End date', '', createFormFieldObject('EndDate', FormFieldType.Date, this.methodStatement.EndDate == null ? null : new Date(this.methodStatement.EndDate), [])));
            this.fieldsArray.push(createFormFieldWrapperObject('Client reference', '', createFormFieldObject('ClientReference', FormFieldType.InputString, this.methodStatement.ClientReference, [])));
            this.fieldsArray.push(createFormFieldWrapperObject('Project reference', '', createFormFieldObject('ProjectReference', FormFieldType.InputString, this.methodStatement.ProjectReference, null)));
        }
        if (this.showCompanyDropdown) {
            this.fieldsArray.push(createFormFieldWrapperObject('Company for which method statement should be copied', '', createFormFieldObject('CompanyId', FormFieldType.Select, this.methodStatement.CompanyId, [Validators.required])));
        }
        if (!this.isAdmin) {
            this.fieldsArray.push(createFormFieldWrapperObject('Location of work', '', createFormFieldObject('SiteId', FormFieldType.Select, this.methodStatement.SiteId || '', [Validators.required])));
            this.fieldsArray.push(createFormFieldWrapperObject('New location of work', '', createFormFieldObject('NewLocationOfWork', FormFieldType.InputString, this.methodStatement.NewLocationOfWork, [Validators.required])));
        }
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class MethodStatementCopyFormieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): MethodStatementCopyFormieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new MethodStatementCopyFormFieldContext(field),
    }
}

export class MethodStatementCopyFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();
        if (field.name === 'Name') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Method statement name');
            this._context.set('errorMessages', {
                'required': 'Method statement name is required'
            });
            this._context.set('maxlength', 200);
            this._context.set('showRemainingCharacterCount', false);
        }
        if (field.name === 'StartDate') {
            this._context.set('required', true);
        } if (field.name === 'EndDate') {
            this._context.set('errorMessages', {
                'datecompare': 'End Date should be greater than Start Date'
            });
        } if (field.name === 'ClientReference') {
            this._context.set('placeholder', 'Client reference');
        } if (field.name === 'ProjectReference') {
            this._context.set('placeholder', 'Project reference');
        } if (field.name === 'SiteId') {
            this._context.set('required', true);
            this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('placeholder', 'Please select');
            this._context.set('errorMessages', {
                'required': 'Location of work is required'
            });
        }
        if (field.name === 'CompanyId') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<string>>([])));
        }
        if (field.name === 'NewLocationOfWork') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Insert new location of work');
            this._context.set('errorMessages', {
                'required': 'This field cannot be empty'
            });
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }
    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): MethodStatementCopyFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}

export class MethodStatementCopyFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}