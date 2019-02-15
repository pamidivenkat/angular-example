import { ReplaySubject } from "rxjs/ReplaySubject";
import { Observable } from "rxjs/Observable";
import { AndroidActivityCallbacks, setActivityCallbacks } from 'tns-core-modules/ui/frame';

const _intentSubject = new ReplaySubject<android.content.Intent>();

export const OnIntent: Observable<any> = _intentSubject.asObservable(); // apply transformation as needed to abstract from platform

@JavaProxy("com.toplinestrategies.insite.MainActivity")
export class Activity extends android.app.Activity {
    private _callbacks: AndroidActivityCallbacks;

    public onCreate(savedInstanceState: android.os.Bundle): void {
        console.log(`Android Activity: On Create`);
        if (!this._callbacks) {
            setActivityCallbacks(this);
        }
        this._callbacks.onCreate(this, savedInstanceState, super.onCreate);

        const creationIntent = this.getIntent();
        _intentSubject.next(creationIntent);
    }

    public onNewIntent(intent: android.content.Intent): void {
        console.log(`Android Activity: onNewIntent`);
        super.onNewIntent(intent);
        _intentSubject.next(intent);
    }

    public onSaveInstanceState(outState: android.os.Bundle): void {
        this._callbacks.onSaveInstanceState(this, outState, super.onSaveInstanceState);
    }

    public onStart(): void {
        console.log(`Android Activity: Start`);
        this._callbacks.onStart(this, super.onStart);
    }

    public onStop(): void {
        this._callbacks.onStop(this, super.onStop);
    }

    public onDestroy(): void {
        console.log(`Android Activity: Destroy`);
        this._callbacks.onDestroy(this, super.onDestroy);
    }

    public onBackPressed(): void {
        this._callbacks.onBackPressed(this, super.onBackPressed);
    }

    public onRequestPermissionsResult(requestCode: number, permissions: Array<String>, grantResults: Array<number>): void {
        this._callbacks.onRequestPermissionsResult(this, requestCode, permissions, grantResults, undefined /*TODO: Enable if needed*/);
    }

    public onActivityResult(requestCode: number, resultCode: number, data: android.content.Intent): void {
        this._callbacks.onActivityResult(this, requestCode, resultCode, data, super.onActivityResult);
    }

}