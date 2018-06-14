import { ElementRef } from '@angular/core';

export interface AeDataTransfer<T> {
    identifier: string;
    model: T;
}
