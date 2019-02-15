import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Pipe({ name: "bypassSecurity" })
export class HtmlPipe implements PipeTransform {
  constructor(private _sanitizer: DomSanitizer) {}
  transform(value: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(value);
  }
}

@Pipe({ name: "removeAllTags" })
export class RemoveAllTagsPipe implements PipeTransform {
  transform(value: string) {
    return value ? value.replace(/<\/?[^>]+(>|$)/g, " ") : value;
  }
}

@Pipe({ name: "removeHtmlTags" })
export class RemoveHtmlTagsPipe implements PipeTransform {
  transform(value: string) {
    return value ? value.replace(/<(?!\s*\/?(br|em)\b)[^>]+>/gi, "") : value;
  }
}

@Pipe({ name: "priceRange" })
export class PriceRangePipe implements PipeTransform {
  transform(value: number): string {
    let range = "";
    for (let i = 0; i < value; i++) {
      range += "$ ";
    }
    return range;
  }
}
