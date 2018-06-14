import { Sensitivity } from '../../../shared/models/sensitivity';
import { fieldSettings } from './field-settings';
export class BaseDocumentCategory {

    constructor() {

    }

    public getEmployeeFieldSettings(): fieldSettings {
        let visibility: boolean = false;
        let mandatory: boolean = false;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }

    public getSiteFieldSettings(): fieldSettings {
        let visibility: boolean = false;
        let mandatory: boolean = false;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }

    public getSensitivityFieldSettings(): fieldSettings {
        let visibility: boolean = false;
        let mandatory: boolean = false;
        let defaultValue: any = Sensitivity.Basic;
        return new fieldSettings(visibility, mandatory, defaultValue);
    }
}