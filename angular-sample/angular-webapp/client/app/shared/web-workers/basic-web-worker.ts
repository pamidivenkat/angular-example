import { Subject } from 'rxjs/Rx';
import * as RxDom from 'rx-dom';

export abstract class BasicWebWorker {
    protected workerFunctionToUrlMap = new WeakMap<Function, string>();
    protected workerSubjectToSubjectMap = new WeakMap<Subject<any>, RxDom.Subject<any>>();

    invoke<T>(workerFunction: (input: any) => T, data?: Array<T>): Subject<any> {
        const url = this.getOrCreateWorkerUrl(workerFunction);
        return this.invokeByUrl<T>(url, data);
    }
    
    invokeByUrl<T>(url: string, data?: Array<any>): Subject<any> {
        let subject = new Subject<any>();
        let workerSubject = RxDom.DOM.fromWebWorker(url);
        workerSubject.subscribeOnNext(val => subject.next(val));
        workerSubject.subscribeOnError(err => subject.error(err))
        workerSubject.subscribeOnCompleted(() => subject.complete());
        this.workerSubjectToSubjectMap.set(subject, workerSubject);
        workerSubject.onNext(JSON.stringify(data));
        return subject;
    }
    
    destroy<T>(sub:Subject<any>): Subject<any> {
        return this.removeObservable(sub);
    }
    
    private getOrCreateWorkerUrl(fn: Function): string {
        let func = fn.toString();
        if (!this.workerFunctionToUrlMap.has(fn)) {
            const url = this.createWorkerUrl(func);
            this.workerFunctionToUrlMap.set(fn, url);
            return url;
        }
        return this.workerFunctionToUrlMap.get(fn);
    }

    private createWorkerUrl(fn: string): string {
        let webWorkerTemplate = `
            self.addEventListener('message', function(e) {
                postMessage((${fn})(e.data));
            });
        `;
        const blob = new Blob([webWorkerTemplate], { type: 'text/javascript' });
        return URL.createObjectURL(blob);
    }
    private removeObservable<T>(sub:Subject<any>) :Subject<any>{
        let workerSubject = this.workerSubjectToSubjectMap.get(sub);
        if (workerSubject) {
            workerSubject.dispose();
        }
        this.workerSubjectToSubjectMap.delete(sub);
        return sub;
    }
}
