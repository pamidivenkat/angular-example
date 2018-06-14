export class fieldSettings {
    visibility: boolean;
    mandatory: boolean;
    defaultValue: any;

    constructor(_visibility: boolean,
        _mandatory: boolean,
        _defaultValue: boolean
    ) {
        this.visibility = _visibility;
        this.mandatory = _mandatory;
        this.defaultValue = _defaultValue;
    }
}
