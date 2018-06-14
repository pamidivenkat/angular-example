export class IFrameWindow {
    private _frame: HTMLIFrameElement;
    private _boundMessageEvent: any;
    private _resolve: any;
    private _reject: any;
    private _promise: Promise<{}>;
    private _defaultTimeout = 5000;
    private _timer: any;

    constructor() {

        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });

        this._boundMessageEvent = this._message.bind(this);
        window.addEventListener('message', this._boundMessageEvent, false);

        this._frame = window.document.createElement('iframe');
        this._frame.style.display = 'none';
        window.document.body.appendChild(this._frame);
    }

    navigate(params) {
        let timeout = params.silentRequestTimeout || this._defaultTimeout;
        this._timer = window.setTimeout(this._timeout.bind(this), timeout);
        this._frame.src = params.url;

        return this._promise;
    }

    private _success(data) {
        this._cleanup();

        this._resolve(data.url);
    }

    private _error(message) {
        this._cleanup();

        this._reject(new Error(message));
    }

    private _cleanup() {
        window.removeEventListener('message', this._boundMessageEvent, false);
        window.clearTimeout(this._timer);
        window.document.body.removeChild(this._frame);

        this._timer = null;
        this._frame = null;
        this._boundMessageEvent = null;
    }

    private _timeout() {
        this._error('Frame window timed out');
    }

    private _message(e) {
        if (this._timer &&
            e.origin === this._origin &&
            e.source === this._frame.contentWindow
        ) {
            let url = e.data;
            if (url) {
                this._success({ url: url });
            }
            else {
                this._error('Invalid response from frame');
            }
        }
    }

    get _origin() {
        return location.protocol + '//' + location.host;
    }
}