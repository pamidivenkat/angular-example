import { isNullOrUndefined } from 'util';
import { ElementRef } from '@angular/core';
import { AeTemplateComponent } from '../../ae-template/ae-template.component';
export class PopoverVm<T> {
    template: AeTemplateComponent<T>;
    isToolTip: boolean;
    context: T;
    sourceElement: ElementRef
}

export function createPopOverVm<T>(template?: AeTemplateComponent<T>,
    context?: T,
    sourceElement?: ElementRef, toolTip?: boolean): PopoverVm<T> {
    return {
        template: template,
        isToolTip: isNullOrUndefined(toolTip) ? false : toolTip,
        context: context,
        sourceElement: sourceElement
    }
}
