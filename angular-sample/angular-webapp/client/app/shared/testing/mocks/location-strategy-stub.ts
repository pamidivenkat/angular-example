import { Injectable } from '@angular/core';

@Injectable()
export class LocationStrategyStub {
    path(includeHash: boolean = false) {

    }
    isCurrentPathEqualTo(path: string, query: string = '') { }
    normalize(url: string) { }
    prepareExternalUrl(url: string) { }
    go(path: string, query: string = '') { }
    replaceState(path: string, query: string = '') { }
    forward() { }
    back() { }
    subscribe(onNext: (value: PopStateEvent) => void, onThrow?: ((exception: any) => void) | null, onReturn?: (() => void) | null) { }
}
