import { isNullOrUndefined } from 'util';
import { Injectable, Injector } from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { LOCATION_INITIALIZED } from '@angular/common';

@Injectable()
export class LocalizationConfig {

    constructor(public locale: LocaleService, public translation: TranslationService, public injector: Injector) { }

    load(providers: string[] = null): Promise<any> {
        let promise: Promise<any> = new Promise((resolve: any) => {
            const locationInitialized = this.injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
            locationInitialized.then(() => {

                this.locale.addConfiguration()
                    .setCookieExpiration(30)
                    .defineDefaultLocale('en', 'GB')
                    .defineCurrency('GBP');
                this.locale.init();
                this.translation.addConfiguration()
                    .addProvider('./assets/translate/root-');

                if (!isNullOrUndefined(providers)) {
                    providers.map((provider: string) => {
                        this.translation.addConfiguration()
                            .addProvider(`./assets/translate/${provider}-`);
                    });
                }




                this.translation.init();
                resolve(true);
            });
        });

        return promise;
    }

}

// AoT compilation requires a reference to an exported function.
export function initLocalization(localizationConfig: LocalizationConfig): Function {
    return () => localizationConfig.load(['healthandsafety', 'employementlaw']);
}

export function initLocalizationWithAdditionProviders(localizationConfig: LocalizationConfig, providers: string[]): Function {
    return () => localizationConfig.load(providers);
}
