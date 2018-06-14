import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    EventEmitter,
    Input,
    OnInit,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
    OnDestroy,
} from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { isNullOrUndefined } from 'util';

import { AtlasError } from '../../shared/error-handling/atlas-error';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { StringHelper } from '../../shared/helpers/string-helper';
import { FormFieldType, IFormBuilderVM, IFormField, IFormFieldWrapper } from '../../shared/models/iform-builder-vm';
import { FormBuilderService } from '../../shared/services/form-builder.service';
import { CommonValidators } from '../../shared/validators/common-validators';
import { AeTemplateComponent } from '../ae-template/ae-template.component';
import { AeClassStyle } from '../common/ae-class-style.enum';
import { AeInputType } from '../common/ae-input-type.enum';
import { BaseElement } from '../common/base-element';
import { createPopOverVm } from '../common/models/popover-vm';
import { CommonHelpers } from "../../shared/helpers/common-helpers";
import { Subscription } from "rxjs/Subscription";

@Component({
    selector: 'ae-form',
    templateUrl: './ae-form.component.html',
    styleUrls: ['./ae-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class AeFormComponent extends BaseElement implements OnInit, AfterContentInit, OnDestroy {

    // Private Fields
    private _formBuilderVM: IFormBuilderVM;
    private _formGroup: FormGroup;
    private _fields: any;
    private _controlTempaltes: AeTemplateComponent<any>[];
    private _switchTextLeft: AeClassStyle = AeClassStyle.TextLeft;
    private _formTitle: string;
    private _isPrimaryTitle: boolean;
    private _lightClass: AeClassStyle = AeClassStyle.Light;
    private _submitted: boolean;
    private _displayFooter: boolean = true;
    private _formValid: boolean;
    private _footerBtnText: { Submit: string, Cancel: string };
    private _originalFormGroup: any;
    private _subScriptions: Subscription[] = [];
    private _requiredSubscriptions: Subscription[] = [];
    // End of Private Fields

    // Constructor
    constructor(private _cdr: ChangeDetectorRef, private _formBuilderService: FormBuilderService) {
        super()
        this._isPrimaryTitle = true;
    }
    // End of Constructor

    // Public Properties
    @Input('submitted')
    get submitted(): boolean {
        return this._submitted;
    }
    set submitted(val: boolean) {
        this._submitted = val;
    }
    get formGroup(): FormGroup {
        return this._formGroup;
    }

    get fields(): any {
        return this._fields;
    }

    get switchTextLeft(): AeClassStyle {
        return this._switchTextLeft;
    }

    get lightClass(): AeClassStyle {
        return this._lightClass;
    }

    @Input('formBuilderData')
    get formBuilderData() {
        return this._formBuilderVM;
    }
    set formBuilderData(val: IFormBuilderVM) {
        this._formBuilderVM = val;
    }
    @Input('Title')
    get Title(): string {
        return this._formTitle;
    }
    set Title(val: string) {
        this._formTitle = val;
    }
    @Input('isPrimaryTitle')
    get isPrimaryTitle() {
        return this._isPrimaryTitle;
    }
    set isPrimaryTitle(value: boolean) {
        this._isPrimaryTitle = value;
    }
    @Input('displayFooter')
    get displayFooter() {
        return this._displayFooter;
    }
    set displayFooter(value: boolean) {
        this._displayFooter = value;
    }

    @Input('footerBtnText')
    get footerBtnText() {
        return this._footerBtnText;
    }
    set footerBtnText(value: { Submit: string, Cancel: string }) {
        this._footerBtnText = value;
    }


    // End of Public Properties
    //Output Bindings
    @Output('onSubmit') _onFormSubmit: EventEmitter<any> = new EventEmitter<any>();
    @Output('onCancel') _onFormCancel: EventEmitter<string> = new EventEmitter<any>();
    @Output('onFormInit') _onFormInit: EventEmitter<any> = new EventEmitter<any>();
    @Output('isFormValid') _isFormValid: EventEmitter<boolean> = new EventEmitter<boolean>();
    //End of Output Bindings

    // View Child Properties
    @ViewChild('inputTemplate') _inputTemplate: TemplateRef<any>
    @ViewChild('checkBoxTemplate') _checkBoxTemplate: TemplateRef<any>
    @ViewChild('radioTemplate') _radioTemplate: TemplateRef<any>
    @ViewChild('radioGroupTemplate') _radioGroupTemplate: TemplateRef<any>
    @ViewChild('autoCompleteTemplate') _autoCompleteTemplate: TemplateRef<any>
    @ViewChild('autoCompleteMultiSelectTemplate') _autoCompleteMultiSelectTemplate: TemplateRef<any>
    @ViewChild('selectTemplate') _selectTemplate: TemplateRef<any>
    @ViewChild('readOnlyTemplate') _readOnlyTemplate: TemplateRef<any>
    @ViewChild('dateTemplate') _dateTemplate: TemplateRef<any>
    @ViewChild('switchTemplate') _switchTemplate: TemplateRef<any>
    @ViewChild('textAreaTemplate') _textAreaTemplate: TemplateRef<any>
    @ViewChild('richTextEditorTemplate') _richTextEditorTemplate: TemplateRef<any>
    @ViewChild('displayTemplate') _displayTemplate: TemplateRef<any>
    @ViewChild('fileUploadTemplate') _fileUploadTemplate: TemplateRef<any>
    @ViewChild('groupcheckBoxTemplate') _groupCheckBoxTemplate: TemplateRef<any>

    // End of View Child Properties

    // Content Child Properties
    @ContentChildren(AeTemplateComponent)
    _ctrolTemplates: QueryList<AeTemplateComponent<any>>;
    // End of Content Child Properties

    // Private Methods
    onSubmit(event) {
        this._submitted = true;
        if (this._formGroup.valid) {
            this._onFormSubmit.emit(this._formGroup.value);
        }
    }

    onCancel(event) {
        this._onFormCancel.emit('cancel');
    }

    private _getDefaultTemplate(fieldType: FormFieldType) {
        switch (fieldType) {
            case FormFieldType.InputString:
            case FormFieldType.InputNumber:
            case FormFieldType.InputEmail:
                return this._inputTemplate;
            case FormFieldType.CheckBox:
                return this._checkBoxTemplate;
            case FormFieldType.Radio:
                return this._radioTemplate;
            case FormFieldType.RadioGroup:
                return this._radioGroupTemplate;
            case FormFieldType.AutoComplete:
                return this._autoCompleteTemplate;
            case FormFieldType.AutoComplteMultiSelect:
                return this._autoCompleteMultiSelectTemplate;
            case FormFieldType.Select:
                return this._selectTemplate;
            case FormFieldType.ReadOnly:
                return this._readOnlyTemplate;
            case FormFieldType.Date:
                return this._dateTemplate;
            case FormFieldType.Switch:
                return this._switchTemplate;
            case FormFieldType.TextArea:
                return this._textAreaTemplate;
            case FormFieldType.RichTextEditor:
                return this._richTextEditorTemplate;
            case FormFieldType.DisplayValue:
                return this._displayTemplate;
            case FormFieldType.FileUpload:
                return this._fileUploadTemplate;
            case FormFieldType.CheckBoxGroup:
                return this._groupCheckBoxTemplate;
            case FormFieldType.DateWithTime:
                return this._dateTemplate;
        }
    }

    private _getDefaultContextItem<T>(formField: IFormFieldWrapper<T>, contextObj: any) {
        let contextObject = Object.assign({}, contextObj);
        switch ((<IFormField<T>>formField.field).type) {
            case FormFieldType.InputString:
                contextObject['inputType'] = AeInputType.text;
                break;
            case FormFieldType.InputNumber:
                contextObject['inputType'] = AeInputType.number;
                break;
            case FormFieldType.InputEmail:
                contextObject['inputType'] = AeInputType.email;
                break;
        }
        return contextObject;
    }

    getTemplate<T>(field: IFormFieldWrapper<T>) {
        let customTempalte = this._getCustomTemplate(field.templateRefId);
        if (isNullOrUndefined(customTempalte)) {
            return this._getDefaultTemplate((<IFormField<any>>field.field).type);
        } else {
            return customTempalte.template;
        }
    }

    getContextItem<T>(field: IFormFieldWrapper<T>, index: string) {
        let contextObject = { index: index, labelText: field.labelText, name: field.field.name };
        if (!isNullOrUndefined(field.context)) {
            let fieldContextData = field.context.getContextData();
            if (!isNullOrUndefined(fieldContextData)) {
                contextObject = ObjectHelper.merge(contextObject, ObjectHelper.createObjectFromMap(field.context.getContextData()));
            }
        }

        if (StringHelper.isNullOrUndefinedOrEmpty(field.templateRefId)) {
            contextObject = this._getDefaultContextItem(field, contextObject);
        } else {
            let customTempalte = this._getCustomTemplate(field.templateRefId);
            if (isNullOrUndefined(customTempalte)) {
                throw new AtlasError(`Template : ${field.templateRefId} does not exisit`);
            } else {
                contextObject = ObjectHelper.merge(contextObject, customTempalte.contextObject);
            }
        }

        this._handleVisibiltyChangesOfFormControl(contextObject);
        this._formRequireValidationCheck(contextObject);
        return contextObject;
    }


    getElementDirectiveContext(context: any) {
        // if (!isNullOrUndefined(context.property)) {
        //     return {
        //         Property: context.property, Value: context.propertyValue
        //     }
        // } else {
        //     return null;
        // }
        return context;

    }

    private _handleVisibiltyChangesOfFormControl(context: any) {
        if (!isNullOrUndefined(context.property) && !isNullOrUndefined(context.propertyValue)) {
            if (isNullOrUndefined(this._originalFormGroup)) {
                this._originalFormGroup = Object.freeze(Object.assign({}, this._formGroup.controls));
                //this._originalFormGroup = new FormGroup()
            }
            let sub = context.propertyValue.subscribe(val => {
                if (val) {
                    this._formGroup.addControl(context.name, this._originalFormGroup[context.name]);
                } else {
                    this._formGroup.removeControl(context.name);
                }
            });
            this._subScriptions.push(sub);
        }
    }

    private _formRequireValidationCheck(context: any) {
        if (!isNullOrUndefined(context.requiredValue)) {
            if (isNullOrUndefined(this._originalFormGroup)) {
                this._originalFormGroup = Object.freeze(Object.assign({}, this._formGroup.controls));
            }
            let sub = context.requiredValue.subscribe(val => {
                if (val) {
                    context['required'] = true;
                }
                else {
                    context['required'] = false;
                }
            });
            this._requiredSubscriptions.push(sub);
        }
    }

    private _getCustomTemplate(fieldTemplateRefId: string) {
        let customTempalte = this._controlTempaltes.filter((t) => t.type === fieldTemplateRefId);
        if (isNullOrUndefined(customTempalte)) {
            return null;
        } else if (customTempalte.length > 1) {
            throw new AtlasError(`Duplicate keys with id ${fieldTemplateRefId} exists`);
        } else {
            return customTempalte[0];
        }
    }

    getOptions(data: any) {
        return data['options'];
    }

    getIsOptGroup(data: any) {
        return data['isOptGroup'] ? data['isOptGroup'] : false;
    }

    getPlaceHolder(data: any) {
        return data['placeholder'] ? data['placeholder'] : '';
    }

    getMaxLength(data: any) {
        return data['maxlength'];
    }

    getMinLength(data: any) {
        return data['minlength'];
    }

    getShowRemainingCharacterCount(data: any) {
        return data['showRemainingCharacterCount'];
    }

    isRequiredField(data: any) {
        return data['required'];
    }

    hideDescription(data: any) {
        return !isNullOrUndefined(data['hideLabelText']);
    }
    hasDescription(data: any) {
        return !StringHelper.isNullOrUndefinedOrEmpty(data['labelText']);
    }
    getIsDisabled(data: any) {
        return data['disabled'];
    }

    getShowTime(data: any) {
        return data['showTime'] ? data['showTime'] : false;
    }

    getHourFormat(data: any) {
        return data['hourFormat'] ? data['hourFormat'] : '24';
    }

    canShowInfoIcon(data: boolean) {
        return data['showInfoIcon'] ? data['showInfoIcon'] : false;
    }

    getCustomCss(data:any):string {
        return data['customCss'] ? data['customCss'] : "";
    }

    getInfoText(data: any) {
        return data['infoText'];
    }

    getSubmitBtnText() {
        if (!isNullOrUndefined(this._footerBtnText) && !isNullOrUndefined(this._footerBtnText.Submit)) {
            return this._footerBtnText.Submit;
        } else {
            return 'Add';
        }
    }

    getCancelBtnText() {
        if (!isNullOrUndefined(this._footerBtnText) && !isNullOrUndefined(this._footerBtnText.Cancel)) {
            return this._footerBtnText.Cancel;
        } else {
            return 'Close';
        }
    }

    getAutoCompleteProperties(data: any, prop: string) {
        switch (prop) {
            case 'multiselect':
                return data['multiselect'];
            case 'items':
                return data['items'];
            case 'dstype':
                return data['dstype'];
            case 'field':
                return data['field'];
            case 'valuefield':
                return data['valuefield'];
            case 'initialtext':
                return data['initialtext'];
            case 'minlength':
                return data['minlength'];
            case 'maxlength':
                return data['maxlength'];
            case 'debounce':
                return data['debounce'];
        }
    }

    public getDisplayValue(data: any) {
        if (!isNullOrUndefined(data['displayValue'])) {
            return data['displayValue']._value;
        }
    }
    getIsFieldDisabled(data: any) {
        if (!isNullOrUndefined(data['disableFieldValue'])) {
            return data['disableFieldValue']._value;
        }
        return false;
    }

    subscribeSearchEvent(event: any, data: any) {
        let searchEvent = data['searchEvent'];
        if (!isNullOrUndefined(searchEvent))
            searchEvent.emit(event);
    }

    subscribeSelectEvent(event: any, data: any) {
        let selectEvent = data['onSelectEvent'];
        if (!isNullOrUndefined(selectEvent))
            selectEvent.emit(event);
    }

    subscribeInputChangeEvent(event: any, data: any) {
        let inputEvent = data['onInputEvent'];
        if (!isNullOrUndefined(inputEvent))
            inputEvent.emit(event);
    }

    fieldHasErrors(context: any): Array<string> {
        let errors = new Array<string>();
        let field = this._formGroup.get(context.name);
        if (!isNullOrUndefined(field) && (!field.pristine || this._submitted)) {
            for (let key in field.errors) {
                let filedErrorMessages = context.errorMessages;
                if (!isNullOrUndefined(filedErrorMessages)) {
                    let errorMessage = filedErrorMessages[key];
                    if (!isNullOrUndefined(errorMessage)) {
                        errors.push(errorMessage);
                    }
                }
                else {
                    let msgs = CommonValidators.getErrorMessages();
                    let errorMessageLambda = msgs[key];
                    if (!isNullOrUndefined(errorMessageLambda)) {
                        errors.push(errorMessageLambda(context));
                    }
                }
            }
        }

        return errors;
    }

    getMinDate(context: any) {
        return context['minDate'] ? context['minDate'] : '';
    }

    getMaxDate(context: any) {
        return context['maxDate'] ? context['maxDate'] : '';
    }

    getYearRange(context: any) {
        return context['yearRange'] ? context['yearRange'] : '2000:2030';
    }

    public getReadOnlyDate(context: any) {
        return context['readonlyInput'] ? true : false;
    }

    getSelectedFileInfo(event: any, data: any) {
        let fileUploadEvent = data['uploadedFileData'];
        if (!isNullOrUndefined(fileUploadEvent) && !isNullOrUndefined(event[0]) && !isNullOrUndefined(event[0].file)) {
            data['fileName'] = event[0].file.name;
            fileUploadEvent.emit({ eventData: event, fieldName: data['name'] });
        }
    }


    getFileUploadProperties(data: any, prop: string) {
        switch (prop) {
            case 'title':
                return data['title'];
            case 'multiple':
                return data['multiple'];
            case 'accept':
                return data['accept'];
        }
    }

    isDownloadble(data: any) {
        return !isNullOrUndefined(data['isDownloadable']);
    }
    showFileName(data: any) {
        if (!isNullOrUndefined(data['showFileName'])) {
            let showUploadedFileName = <boolean>data['showFileName'];
            return showUploadedFileName;
        }

        return true;
    }

    downloadFile(data: any) {
        let onDownloadFile = data['downloadFileData'];
        if (!isNullOrUndefined(onDownloadFile))
            onDownloadFile.emit(data['name']);
    }
    showHyperLink(data: any) {
        return !isNullOrUndefined(data['showHyperLink']);
    }

    onAnchorButtonClick(data: any) {
        let onAnchorClick = data['onAnchorClick'];
        if (!isNullOrUndefined(onAnchorClick))
            onAnchorClick.emit(data['name']);
    }
    // End of Private Methods

    // Public methods
    subscribeBlurEvent(event: any, data: any) {
        let onBlur = data['onBlur'];
        if (!isNullOrUndefined(onBlur))
            onBlur.emit(event);
    }
    subscribeDateChange(event: any, data: any) {
        let onDateChange = data['onDateChange'];
        if (!isNullOrUndefined(onDateChange))
            onDateChange.emit(event);
    }

    subscribeSwitchChange(event: any, data: any) {
        let onSwitchChange = data['onSwitchChange'];
        if (!isNullOrUndefined(onSwitchChange))
            onSwitchChange.emit(event);
    }

    subscribeSelectChange(event: any, data: any) {
        let onSelctChange = data['onSelectChange'];
        if (!isNullOrUndefined(onSelctChange))
            onSelctChange.emit(event);
    }

    subscribeOnReady(event: any, data: any) {
        let onEditorReady = data['onEditorReady'];
        if (!isNullOrUndefined(onEditorReady)) {
            onEditorReady.emit(event);
        }
    }

    subscribeUnSelect(event: any, data: any) {
        let unSelectEvent = data['onUnSelect'];
        if (!isNullOrUndefined(unSelectEvent))
            unSelectEvent.emit(event);
    }

    subscribeClearSelected(event: any, data: any) {
        let clearSelectEvent = data['onClearSelect'];
        if (!isNullOrUndefined(clearSelectEvent))
            clearSelectEvent.emit(event);
    }

    isFieldOptionByChoice(field: any, i: any) {
        let context = this.getContextItem(field, i)
        let isOptionalFiled = context['isOptional'];
        return isNullOrUndefined(isOptionalFiled) ? false : isOptionalFiled;
    }

    ngOnInit() {
        super.ngOnInit();
        this._formGroup = this._formBuilderService.build(this._formBuilderVM);
        this._fields = this._formBuilderVM.getFields();
    }

    ngAfterContentInit(): void {
        this._controlTempaltes = this._ctrolTemplates.toArray();
        this._onFormInit.emit(this._formGroup);
        let sub = this._formGroup.statusChanges.subscribe(currentStatus => {
            let status: boolean = false;
            if (currentStatus === 'INVALID') {
                status = false;
            }
            if (currentStatus === 'VALID') {
                status = true;
            }
            if (this._formValid !== status) {
                this._formValid = status;
                this._isFormValid.emit(this._formValid);
            }
        });
        this._subScriptions.push(sub);
    }
    isGroupField(field: any) {
        return !isNullOrUndefined(field.field.isGroup) && (field.field.isGroup === true);
    }

    getGroupedFields(field: any) {
        let fields;
        if (this.isGroupField(field)) {
            fields = (field.field).getFields();
        }
        return fields;
    }


    ngOnDestroy(): void {
        if (this._subScriptions) {
            this._subScriptions.forEach(sub => {
                if (sub) {
                    sub.unsubscribe();
                }
            });
        }

        if (this._requiredSubscriptions) {
            this._requiredSubscriptions.forEach(sub => {
                if (sub) {
                    sub.unsubscribe();
                }
            });
        }
    }
    // End of Public methods

}
