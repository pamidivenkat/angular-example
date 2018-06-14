import { BehaviorSubject } from 'rxjs/Rx';
import { RouterOutletMap, Routes, UrlSerializer, UrlTree, NavigationExtras } from '@angular/router';
import { Compiler, Injector, NgModuleFactoryLoader, Type, Injectable } from '@angular/core';
@Injectable()
export class RouterMock {
    public url: string = '';
    
    navigateByUrl(url: string | UrlTree, extras?: NavigationExtras): Promise<boolean> {
        let promise: Promise<boolean> = new Promise((resolve: any) => {
            return resolve(true);
        });
        return promise;
    }
    navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
        let promise: Promise<boolean> = new Promise((resolve: any) => {
            return resolve(true);
        });
        return promise;
    }

    public events: BehaviorSubject<any> = new BehaviorSubject<any>('');
    public createUrlTree(){
        return new UrlTree();
    }
    public serializeUrl(){
        return '';
    }
    public params: BehaviorSubject<string> = new BehaviorSubject<string>(null);
}
