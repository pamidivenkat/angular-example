import { CommonValidators } from './../../shared/validators/common-validators';
import { AeSelectItem } from './../../atlas-elements/common/models/ae-select-item';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { MethodStatement } from './method-statement';
import { FormFieldType, IFormBuilderVM, IFormFieldWrapper, IFormFieldContext, IFormField } from './../../shared/models/iform-builder-vm';
import * as Immutable from 'immutable';
import { Context } from 'vm';
import { ValidatorFn, Validators } from '@angular/forms';
import { AeDatasourceType } from "./../../atlas-elements/common/ae-datasource-type";

export class MethodStatementGeneralForm implements IFormBuilderVM {

    public name: string;
    public fieldsArray: Array<MethodStatementGeneralFormFieldWrapper<any>> = new Array();
    public methodStatement: MethodStatement;
    public isExample : boolean;

    constructor(name: string, model: MethodStatement, isExample : boolean) {
        this.name = name;
        this.methodStatement = model;
        this.isExample = isExample;
    }
    public setIsExample(isExample : boolean){

    }
    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Method statement name', '', createFormFieldObject('Name', FormFieldType.InputString, this.methodStatement.Name, [Validators.required]),this.isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Start date', '', createFormFieldObject('StartDate', FormFieldType.Date, this.methodStatement.StartDate, [Validators.required]),this.isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('End date', '', createFormFieldObject('EndDate', FormFieldType.Date, this.methodStatement.EndDate, null),this.isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Location of work', '', createFormFieldObject('SiteId', FormFieldType.Select, this.methodStatement.SiteId || '', [Validators.required]),this.isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('New location of work', '', createFormFieldObject('NewLocationOfWork', FormFieldType.InputString, this.methodStatement.NewLocationOfWork, [Validators.required]),this.isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Client name', '', createFormFieldObject('ClientName', FormFieldType.InputString, this.methodStatement.ClientName, null),this.isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Client address', '', createFormFieldObject('ClientAddress', FormFieldType.TextArea, this.methodStatement.ClientAddress, null),this.isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Client telephone number', '', createFormFieldObject('ClientTelephoneNumber', FormFieldType.InputString, this.methodStatement.ClientTelephoneNumber, [CommonValidators.phoneUK()]),this.isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Client reference', '', createFormFieldObject('ClientReference', FormFieldType.InputString, this.methodStatement.ClientReference, [CommonValidators.maxLength(50)]),this.isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Project reference', '', createFormFieldObject('ProjectReference', FormFieldType.InputString, this.methodStatement.ProjectReference,  [CommonValidators.maxLength(50)]),this.isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Site supervisor', '', createFormFieldObject('SiteSupervisor', FormFieldType.InputString, this.methodStatement.SiteSupervisor, null),this.isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Site supervisor telephone number', '', createFormFieldObject('SiteSupervisorTelephone', FormFieldType.InputString, this.methodStatement.SiteSupervisorTelephone, [CommonValidators.phoneUK()]),this.isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Principal designer', '', createFormFieldObject('PrincipalDesigner', FormFieldType.InputString, this.methodStatement.PrincipalDesigner, null),this.isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Principal contractor', '', createFormFieldObject('PrincipalContractor', FormFieldType.InputString, this.methodStatement.PrincipalContractor, null),this.isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Description', '', createFormFieldObject('Description', FormFieldType.TextArea, this.methodStatement.Description, null),this.isExample));

        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class MethodStatementGeneralFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>, isExample : boolean): MethodStatementGeneralFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new MethodStatementGeneralFormFieldContext(field,isExample),
    }
}

export class MethodStatementGeneralFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any> , isExample : boolean) {
        this._context = new Map<string, any>();
        if (field.name === 'Name') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Method statement name');
            this._context.set('errorMessages',{
                'required':'Method statement name is required'
            });
            this._context.set('maxlength', 200);
            this._context.set('showRemainingCharacterCount', false);
        } if (field.name === 'StartDate') {
            this._context.set('required', true);
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(true));
        } if (field.name === 'EndDate') {
            this._context.set('property', 'visibility');
            this._context.set('errorMessages', {
                'datecompare': 'End Date should be greater than Start Date'
            });
            this._context.set('propertyValue', new BehaviorSubject<boolean>(true));
        } if (field.name === 'SiteId') {
            this._context.set('required', true);
            this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('placeholder', 'Please select');
             this._context.set('errorMessages',{
                'required':'Location of work is required'
            });
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(true));
        } if (field.name === 'NewLocationOfWork') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Insert new location of work');
             this._context.set('errorMessages',{
                'required':'This field cannot be empty'
            });
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        } if (field.name === 'ClientName') {
            this._context.set('placeholder', 'Client name');
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(true));
        } if (field.name === 'ClientAddress') {
            this._context.set('placeholder', 'Client address');
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(true));
        } if (field.name === 'ClientTelephoneNumber') {
            this._context.set('placeholder', 'Client telephone number');
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(true));
        } if (field.name === 'ClientReference') {
            this._context.set('placeholder', 'Client reference');
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(true));
            this._context.set('maxlength', 50);
            this._context.set('showRemainingCharacterCount', false);
        } if (field.name === 'ProjectReference') {
            this._context.set('placeholder', 'Project reference');
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(true));
            this._context.set('maxlength', 50);
            this._context.set('showRemainingCharacterCount', false);
        } if (field.name === 'SiteSupervisor') {
            this._context.set('placeholder', 'Site supervisor');
            this._context.set('property', 'visibility');
            if(!isExample){
               this._context.set('isOptional', true);                
            }
            this._context.set('propertyValue', new BehaviorSubject<boolean>(true));
        } if (field.name === 'SiteSupervisorTelephone') {
            this._context.set('placeholder', 'Site supervisor telephone number');
            this._context.set('property', 'visibility');
            if(!isExample){
               this._context.set('isOptional', true);                
            }
            this._context.set('propertyValue', new BehaviorSubject<boolean>(true));
        } if (field.name === 'PrincipalDesigner') {
            this._context.set('placeholder', 'Principal designer');
            this._context.set('property', 'visibility');
            if(!isExample){
               this._context.set('isOptional', true);                
            }
            this._context.set('propertyValue', new BehaviorSubject<boolean>(true));
        } if (field.name === 'PrincipalContractor') {
            this._context.set('placeholder', 'Principal contractor');
            this._context.set('property', 'visibility');
            if(!isExample){
               this._context.set('isOptional', true);                
            }
            this._context.set('propertyValue', new BehaviorSubject<boolean>(true));
        } if (field.name === 'Description') {
            this._context.set('placeholder', 'Description');
            this._context.set('maxlength', 1000);
            this._context.set('showRemainingCharacterCount', true);
        }
    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): MethodStatementGeneralFormFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}

export class MethodStatementGeneralFormFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}