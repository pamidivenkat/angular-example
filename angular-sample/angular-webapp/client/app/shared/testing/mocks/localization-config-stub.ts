import { Injectable } from '@angular/core';
import { LocalizationConfig } from '../../localization-config';

@Injectable()
export class LocalizationConfigStub {
    load(providers: string[] = null): Promise<any> {
        let promise: Promise<any> = new Promise((resolve: any) => {
            return resolve(true);
        });
        return promise;
    }

}
