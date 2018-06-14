import { Directive, Input, ElementRef, Renderer } from '@angular/core';
@Directive(
    {
        selector: '[scrollIntoView]'
    })
export class ScrollIntoViewDirective {
    @Input('scrollIntoView')
    set scrollIntoView(value: boolean) {
        if (value) {
            if (this.elementRef.nativeElement.scrollIntoViewIfNeeded) {
                this.elementRef.nativeElement.scrollIntoViewIfNeeded()
            }
            else {
                this.elementRef.nativeElement.scrollIntoView();
            }
        }
    }

    constructor(private elementRef: ElementRef
        , private renderer: Renderer) {

    }

}