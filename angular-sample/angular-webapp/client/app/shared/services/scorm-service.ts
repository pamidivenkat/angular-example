import { Injectable } from '@angular/core';

@Injectable()
export class ScormService {
    // SCO window default features
    private _wToolbar = false;
    private _wTitlebar = false;
    private _wLocation = true;
    private _wStatus = true;
    private _wScrollbars = true;
    private _wResizable = true;
    private _wMenubar = false;
    private _isLoaded = false;
    // The width of the SCO window when launched
    private _wWidth = 1024;
    // The height of the SCO window when launched
    private _wHeight = 768;

    constructor() {

    }

    private _openWindow(winURL, winName, winW, winH, winOpts) {
        let winOptions = winOpts + ',width=' + winW + ',height=' + winH;
        let newWin = window.open(winURL, winName, winOptions);
        newWin.moveTo(0, 0);
        newWin.focus();
        return newWin;
    }


    public initSCO(window, storage, prefix, callback, loadCallback) {
        prefix = typeof prefix !== 'undefined' ? prefix : '';
        callback = typeof callback !== 'undefined' ? callback : console.log;

        window.API = {};

        window.scormStatus = {
            lesson_status: 'incomplete',
            score_raw: 0,
            score_max: 100,
            score_min: 0,
            session_time: 0,
            detailed_answers: {}
        };

        window.API.LMSInitialize = function () {

        };

        window.API.LMSTerminate = function () {
        };

        window.API.LMSGetValue = function (varName) {

            varName = prefix + varName;
            let ret = storage.getItem(varName);            
            if (ret == null && (varName.indexOf('_count', this.length - '_count'.length) !== -1)) {
                ret = 0;
                storage.setItem(varName, ret);
            }
            return ret;
        };

        window.API.LMSSetValue = function (varName, varValue) {
            
            
            //let m = varName.match(/cmi\.interactions\.([0-9]+)\.id/);
            varName = prefix + varName;
            let m = varName.match(/([0-9a-z-]+)cmi\.interactions\.([0-9]+)\.id/);
            
            if (m != null) {
                storage.setItem(prefix + 'cmi.interactions._count', parseInt(m[2]) + 1);               
            }

            m = varName.match(/([0-9a-z-]+)cmi\.interactions\.([0-9]+)\.result/);
            if (m != null) {
                var key = storage.getItem(prefix + 'cmi.interactions.' + parseInt(m[2]) + '.id');
                window.scormStatus.detailed_answers[key] = varValue;
            }

            if (varName == prefix + 'cmi.core.lesson_status')
                window.scormStatus.lesson_status = varValue;
            if (varName == prefix + 'cmi.core.score.raw')
                window.scormStatus.score_raw = varValue;
            if (varName == prefix + 'cmi.core.score.max')
                window.scormStatus.score_max = varValue;
            if (varName == prefix + 'cmi.core.score.min')
                window.scormStatus.score_min = varValue;
            if (varName == prefix + 'cmi.core.session_time') {
                window.scormStatus.session_time = varValue;
                if (!this._isLoaded) {
                    loadCallback(true);
                    this._isLoaded = true;
                }
            }

            storage.setItem(varName, varValue);
        };

        window.API.LMSCommit = function () {
        };

        window.API.LMSFinish = function () {
            
            callback(prefix, window.scormStatus.lesson_status);
            return true;
        };

        window.API.LMSGetLastError = function () {
        };

        window.API.LMSGetErrorString = function () {
        };

        window.API.LMSGetDiagnostic = function () {
        };
    }

    private supports_html5_storage() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    }

    public launchSCO(scormId: string, path: string, finishCallback, loadCallback) {
        // users of old browsers will not be able to save their progress locally (but they will be able to store it server side)
        // if (!this.supports_html5_storage()) {
        //     window.localStorage = {};
        // }

        this.initSCO(
            window,
            window.localStorage,
            scormId,
            finishCallback,
            loadCallback);

    }
}