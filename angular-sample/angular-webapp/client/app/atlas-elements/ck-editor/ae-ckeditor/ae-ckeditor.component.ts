import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ContentChildren, QueryList, NgZone, SimpleChanges, forwardRef, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, ElementRef, OnChanges, AfterViewInit, OnDestroy } from '@angular/core';
import { AeCkgroupDirective } from './../ae-ckgroup.directive';
import { AeCkbuttonDirective } from './../ae-ckbutton.directive';
import { BaseElementGeneric } from './../../common/base-element-generic';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from "@angular/forms";
import { isNullOrUndefined } from "util";

declare var CKEDITOR: any;

@Component({
  selector: 'ae-ckeditor',
  templateUrl: './ae-ckeditor.component.html',
  styleUrls: ['./ae-ckeditor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AeCkeditorComponent),
      multi: true,
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AeCkeditorComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AeCkeditorComponent extends BaseElementGeneric<any> implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @Input() config: any;
  @Input() readonly: boolean;
  @Input() debounce: string;
  @Input() placeholder: string;
  @Input() maxLength: number;
  @Input() minLength: number;
  @Input() required: boolean;

  @Output() change = new EventEmitter();
  @Output() ready = new EventEmitter();
  @Output() blur = new EventEmitter();
  @Output() focus = new EventEmitter();
  @ViewChild('host') host: any;
  @ContentChildren(AeCkbuttonDirective) toolbarButtons: QueryList<AeCkbuttonDirective>;
  @ContentChildren(AeCkgroupDirective) toolbarGroups: QueryList<AeCkgroupDirective>;

  _value = '';
  instance: any;
  debounceTimeout: any;
  zone: NgZone;

  onModelChange: Function = () => { };
  onModelTouched: Function = () => { };

  /**
   * Constructor
   */
  constructor(protected cdr: ChangeDetectorRef
    , private elementRef: ElementRef
    , zone: NgZone) {
    super(cdr);
    this.zone = zone;

    this.config = {
      plugins: 'dialogui,dialog,a11yhelp,dialogadvtab,basicstyles,bidi,blockquote,clipboard,button,panelbutton,panel,floatpanel,colorbutton,colordialog,templates,menu,contextmenu,div,'
      + 'resize,toolbar,elementspath,enterkey,entities,popup,filebrowser,find,fakeobjects,floatingspace,listblock,richcombo,font,forms,format,horizontalrule,htmlwriter,iframe,wysiwygarea,'
      + 'image,indent,indentblock,indentlist,smiley,justify,menubutton,language,link,list,liststyle,magicline,maximize,newpage,pagebreak,pastetext,pastefromword,preview,print,removeformat,save,'
      + 'selectall,showblocks,showborders,sourcearea,specialchar,'//scayt,
      + 'stylescombo,tab,table,tabletools,undo,wsc',
      // skin: 'bootstrapck',
      uiColor: '#f8f8f8',
      toolbar: [
        ['Styles', 'Format'],
        ['Bold', 'Italic', 'Underline', 'Strike'],
        ['TextColor', 'BGColor'],
        ['Undo', 'Redo'],
        ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'],
        ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', 'lineheight'],
        ['Image', 'PasteFromWord', 'Table', 'PageBreak', 'Source']
      ],
      extraAllowedContent: '*{*};merge-field; merge[*](*){*}; merge-empty[*](*){*};hide-field;youtubelink[*](*){*}',
      ignoreEmptyParagraph: true,
      pasteFromWordPromptCleanup: false,
      pasteFromWordRemoveStyles: false,
      pasteFromWordRemoveFontStyles: false,
      allowedContent: true
    };
  }

  get value(): any { return this._value; }
  @Input() set value(v) {
    if (v !== this._value) {
      this._value = v;
      this._propagateChange(this.value);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.readonly && this.instance) {
      this.instance.setReadOnly(changes.readonly.currentValue);
    }
  }

  /**
   * On component destroy
   */
  ngOnDestroy() {
    if (this.instance) {
      setTimeout(() => {
        this.instance.removeAllListeners();
        CKEDITOR.instances[this.instance.name].destroy();
        this.instance.destroy();
        this.instance = null;
      });
    }
  }

  /**
   * On component view init
   */
  ngAfterViewInit() {
    // Configuration
    this.ckeditorInit(this.config || {});

  }

  /**
   * Value update process
   */
  updateValue(value: any) {
    this.zone.run(() => {
      this.value = value;

      // super._onChange(value);
      this._propagateChange(this.value);

      this.registerOnTouched(value);
      this.change.emit(value);
      this.cdr.markForCheck();
    });
  }

  /**
   * CKEditor init
   */
  ckeditorInit(config: any) {
    if (typeof CKEDITOR === 'undefined') {
      console.warn('CKEditor 4.x is missing (http://ckeditor.com/)');

    } else {
      if (this.readonly) {
        config.readOnly = this.readonly;
      }
      // CKEditor replace textarea
      this.instance = CKEDITOR.replace(this.host.nativeElement, config);

      // Set initial value
      this.instance.setData(this.value);

      // listen for instanceReady event
      this.instance.on('instanceReady', (evt: any) => {
        // send the evt to the EventEmitter
        this.ready.emit(evt);
      });

      // CKEditor change event
      this.instance.on('change', () => {

        let value = this.instance.getData();

        let text = this.instance.editable().getText();
        // this.registerOnTouched(value);
        this.onModelChange(value);
        // Debounce update
        if (this.debounce) {
          if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
          this.debounceTimeout = setTimeout(() => {
            this.updateValue(value);
            this.debounceTimeout = null;
          }, parseInt(this.debounce));

          // Live update
        } else {
          this.updateValue(value);
        }
      });

      // CKEditor blur event
      this.instance.on('blur', (evt: any) => {
        // this.onModelTouched();
        this.blur.emit(evt);
      });

      // CKEditor focus event
      this.instance.on('focus', (evt: any) => {
        // this.onModelTouched();
        this.focus.emit(evt);
      });

      // Add Toolbar Groups to Editor. This will also add Buttons within groups.
      this.toolbarGroups.forEach((group) => {
        group.initialize(this);
      });
      // Add Toolbar Buttons to Editor.
      this.toolbarButtons.forEach((button) => {
        button.initialize(this);
      });

    }
  }

  /**
   * Implements ControlValueAccessor
   */
  writeValue(value: any) {
    this._value = value;
    if (this.instance) {
      this.instance.setData(value);
    }
  }

  registerOnChange(fn: Function): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onModelTouched = fn;
  }

  validate() {
    if (isNullOrUndefined(this.instance)) {
      return null;
    }

    let err: {
      minLengthError?: { given: number, minLength: number };
      maxLengthError?: { given: number, maxLength: number };
      requiredError?: { empty: boolean }
    } = {},
      valid = true;

    const textLength = this.instance.editable().getText().trim().length;

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
  // onChange(_: any) { }
  // onTouched() { }
  // registerOnChange(fn: any) { this.onChange = fn; }
  // registerOnTouched(fn: any) { this.onTouched = fn; }

}
