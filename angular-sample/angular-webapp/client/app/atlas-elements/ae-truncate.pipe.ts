import { Pipe, PipeTransform } from '@angular/core';
import { isNullOrUndefined } from "util";

@Pipe({
    name: 'limitTo'
})
export class TruncatePipe implements PipeTransform {

    transform(value: string, limit: number): string {
        if (!isNullOrUndefined(value)) {
            return value.length > limit ? value.substring(0, limit) : value;
        }

        return '';
    }

}
