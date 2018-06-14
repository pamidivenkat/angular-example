import { Pipe, PipeTransform } from '@angular/core';
import { isNullOrUndefined } from 'util';

@Pipe({
  name: 'blockChecked',
  pure: false
})
export class BlockCheckedPipe implements PipeTransform {

  transform(items: any[], args?: any): any {
    if (isNullOrUndefined(items)) {
      return items;
    }

    return items.filter(item => item.Checked === true);
  }

}
