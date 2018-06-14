import { StringHelper } from '../../shared/helpers/string-helper';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'aeHighlighttext'
})
export class AeHighlighttextPipe implements PipeTransform {

 transform(text: string, search): string {
   if(search && !StringHelper.isNullOrUndefinedOrEmpty(search)){
    var pattern = search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    pattern = pattern.split(' ').filter((t) => {
      return t.length > 0;
    }).join('|');
    var regex = new RegExp(pattern, 'gi');

    return text.replace(regex, (match) => `<span class="ui-state-highlightmatch">${match}</span>`);
  }
  return text;
 }

}
