import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class TranslationServiceStub {
    getLanguage(): string {
        return "en-GB";
    }
    translate(keys: string | string[], args?: any, lang?: string): string | any {
        return keys;
    }
    translationChanged: EventEmitter<string> = new EventEmitter<string>(false);
    translationError: EventEmitter<any> = new EventEmitter<string>(false);
}