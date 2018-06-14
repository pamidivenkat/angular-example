import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'aePixel'
})
export class AePixelPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return `${value.toString()}px`;
  }

}
