import { isNullOrUndefined } from 'util';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, Input, Output, EventEmitter, forwardRef, ViewEncapsulation } from '@angular/core';
import { OnInit } from '@angular/core';
import { Component, SimpleChanges } from '@angular/core';
import { BaseElementGeneric } from './../common/base-element-generic';
import * as Quill from 'quill';
import { TableBlock, TableRowBlock, TablecolumnBlock, TableHeadBlock, TableFooterBlock, TableHeaderBlock, TableBodyBlock } from "../../shared/blots/table-blots";
import { MergeTag, MergeEmpty, MergeField, SpanTag, BreakTag, DivTag, ParagraphTag } from '../../shared/blots/merge-tag-blots';

@Component({
    selector: 'ae-rte',
    templateUrl: './ae-editor.component.html',
    styleUrls: [
        './ae-editor.component.scss',
        '../../../../node_modules/quill/dist/quill.core.css',
        '../../../../node_modules/quill/dist/quill.snow.css'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => AeRichTextEditorComponent),
        multi: true
    }, {
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => AeRichTextEditorComponent),
        multi: true
    }],
    encapsulation: ViewEncapsulation.None
})
export class AeRichTextEditorComponent extends BaseElementGeneric<any> implements OnInit {
    // Private Fields
    private _quillEditor: any;
    private _editorElem: HTMLElement;
    private _emptyArray: any[] = [];

    defaultModules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],

            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
            [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
            [{ 'direction': 'rtl' }],                         // text direction

            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

            [{ 'color': this._emptyArray.slice() }, { 'background': this._emptyArray.slice() }],   // dropdown with defaults from theme
            [{ 'font': this._emptyArray.slice() }],
            [{ 'align': this._emptyArray.slice() }],

            ['clean'],                                         // remove formatting button

            ['link', 'image', 'video']                         // link and image, video
        ]
    };

    // End of Private Fields

    // Public properties
    @Input() modules: { [index: string]: Object };
    @Input() readOnly: boolean;
    @Input() placeholder: string;
    @Input() maxLength: number;
    @Input() minLength: number;
    @Input() required: boolean;
    @Input() formats: string[];
    @Input() bounds: HTMLElement | string;
    // End of Public properties

    // Public Output bindings
    @Output() onEditorCreated: EventEmitter<any> = new EventEmitter();
    @Output() onContentChanged: EventEmitter<any> = new EventEmitter();
    @Output() onSelectionChanged: EventEmitter<any> = new EventEmitter();
    @Output() onModelConentChange: EventEmitter<string> = new EventEmitter<string>();

    onModelChange: Function = () => { };
    onModelTouched: Function = () => { };
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ContentChild bindings
    // End of Public ContentChild bindings

    // Constructor
    constructor(protected cdr: ChangeDetectorRef, private elementRef: ElementRef) {
        super(cdr);
    }
    // End of constructor

    // Private methods
    // End of private methods

    // Public methods
    ngOnInit() {
        super.ngOnInit();
    }

    ngAfterViewInit() {
        let Parchment = Quill.import('parchment');
        let alignLeft = new Parchment.Attributor.Style('align', 'margin-left');
        Quill.register(alignLeft);
        var SizeStyle = Quill.import('attributors/style/size');
        Quill.register(SizeStyle, true);
        Quill.register(
            {
                'formats/table': TableBlock,
                'formats/tr': TableRowBlock,
                'formats/td': TablecolumnBlock,
                'formats/thead': TableHeaderBlock,
                'formats/th': TableHeadBlock,
                'formats/tbody': TableBodyBlock,
                'formats/tfoot': TableFooterBlock,
                'formats/merge': MergeTag,
                'formats/merge-empty': MergeEmpty,
                'formats/merge-field': MergeField,
                'formats/span': SpanTag,
                'formats/div': DivTag,
            }, true);
        const toolbarElem = this.elementRef.nativeElement.querySelector('[quill-editor-toolbar]');
        let modules = this.modules || this.defaultModules;

        if (toolbarElem) {
            modules['toolbar'] = toolbarElem;
        }

        this.elementRef.nativeElement.insertAdjacentHTML('beforeend', '<div quill-editor-element></div>');
        this._editorElem = this.elementRef.nativeElement.querySelector('[quill-editor-element]');

        this._quillEditor = new Quill(this._editorElem, {
            modules: modules,
            placeholder: this.placeholder || 'Insert text here ...',
            readOnly: this.readOnly || false,
            theme: 'snow',
            formats: this.formats
        });

        if (this.value) {
            this._quillEditor.pasteHTML(this.value);
        }

        this.onEditorCreated.emit(this._quillEditor);

        // mark model as touched if editor lost focus
        this._quillEditor.on('selection-change', (range: any, oldRange: any, source: string) => {
            this.onSelectionChanged.emit({
                editor: this._quillEditor,
                range: range,
                oldRange: oldRange,
                source: source,
                bounds: this.bounds || document.body
            });

            if (!range) {
                this.onModelTouched();
            }
        });

        // update model if text changes
        this._quillEditor.on('text-change', (delta: any, oldDelta: any, source: string) => {
            let html: (string | null) = this._editorElem.children[0].innerHTML;
            const text = this._quillEditor.getText();
            if (html === '<p><br></p>') {
                html = null;
            }

            this.onModelConentChange.emit(html);
            this.onModelChange(html);

            this.onContentChanged.emit({
                editor: this._quillEditor,
                html: html,
                text: text,
                delta: delta,
                oldDelta: oldDelta,
                source: source
            });
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['readOnly'] && this._quillEditor) {
            this._quillEditor.enable(!changes['readOnly'].currentValue);
        }
    }

    writeValue(currentValue: any) {
        this.value = currentValue;

        if (this._quillEditor) {
            if (currentValue) {
                this._quillEditor.pasteHTML(currentValue);
                return;
            }
            this._quillEditor.setText('');
        }
    }

    registerOnChange(fn: Function): void {
        this.onModelChange = fn;
    }

    registerOnTouched(fn: Function): void {
        this.onModelTouched = fn;
    }

    validate() {
        if (!this._quillEditor) {
            return null;
        }

        let err: {
            minLengthError?: { given: number, minLength: number };
            maxLengthError?: { given: number, maxLength: number };
            requiredError?: { empty: boolean }
        } = {},
            valid = true;

        const textLength = this._quillEditor.getText().trim().length;

        if (this.minLength && textLength && textLength < this.minLength) {
            err.minLengthError = {
                given: textLength,
                minLength: this.minLength
            };

            valid = false;
        }

        if (this.maxLength && textLength > this.maxLength) {
            err.maxLengthError = {
                given: textLength,
                maxLength: this.maxLength
            };

            valid = false;
        }

        if (this.required && !textLength) {
            err.requiredError = {
                empty: true
            };

            valid = false;
        }

        return valid ? null : err;
    }
    // End of public methods
}

