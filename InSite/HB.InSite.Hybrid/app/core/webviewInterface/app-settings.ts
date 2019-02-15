import {Observable} from 'data/observable';
/**
 * View Model for the AppSettingsWVInterface.
 */
class AppSettingsWVInterface extends Observable{
    private _settings: any;
    public initSettings: any = { "env" : "nativeScript" };
    constructor() {
        super();
    }
    
    get settings() {
        return this._settings;
    }
    
    set settings(value: any) {
        this._settings = value;
    }
    
}

export var appSettingsWVInterface = new AppSettingsWVInterface();
