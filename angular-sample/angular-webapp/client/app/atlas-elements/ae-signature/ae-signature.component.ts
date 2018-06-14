import { OnInit, ChangeDetectionStrategy, ViewEncapsulation, Component, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { ViewChild, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { BaseElementGeneric } from '../common/base-element-generic';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';

@Component({
  selector: 'ae-signature',
  templateUrl: './ae-signature.component.html',
  styleUrls: ['./ae-signature.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AeSignatureComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class AeSignatureComponent implements ControlValueAccessor {

  @ViewChild(SignaturePad) public signaturePad: SignaturePad;

  constructor(protected cdr: ChangeDetectorRef) {

  }

  @Output()
  private aeChange: EventEmitter<any> = new EventEmitter<any>();

  public options: Object = { minWidth: 0.2, maxWidth: 2, velocityFilterWeight: 0.8 };

  public _signature: any = null;

  public propagateChange: Function = null;

  get signature(): any {
    return this._signature;
  }

  set signature(value: any) {
    this._signature = value;
    this.propagateChange(this.signature);
  }

  public writeValue(value: any): void {
    if (!value) {
      return;
    }
    this._signature = value;
    this.signaturePad.fromDataURL(this.signature);
  }

  public registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  public registerOnTouched(): void {
    // no-op
  }

  public ngAfterViewInit(): void {
    this.signaturePad.clear();
  }

  public drawBegin(): void {
    console.log('begin drawing');
  }

  public drawComplete(): void {
    this.signature = this.signaturePad.toDataURL();
    this.aeChange.emit(this.signature);
  }

  public clear(): void {
    this.signaturePad.clear();
    this.signature = '';
  }
}


