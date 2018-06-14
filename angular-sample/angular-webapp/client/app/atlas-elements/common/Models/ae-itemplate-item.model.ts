import { TemplateRef } from '@angular/core';
export interface AeITemplateItem<T> {
    template:TemplateRef<any>;
    context:T;
    last:boolean;
    first:boolean;
    index:number;
}
