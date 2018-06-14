import { EventEmitter, Injectable } from '@angular/core';
import { LocaleService } from 'angular-l10n';

@Injectable()
export class LocaleServiceStub {
    getDefaultLocale(): string {
        return 'en-GB';
    }
    getCurrentCurrency(): string {
        return 'GBP';
    }
    languageCodeChanged: EventEmitter<string> = new EventEmitter<string>(false);
    defaultLocaleChanged: EventEmitter<string> = new EventEmitter<string>(false);
    currencyCodeChanged: EventEmitter<string> = new EventEmitter<string>(false);

}