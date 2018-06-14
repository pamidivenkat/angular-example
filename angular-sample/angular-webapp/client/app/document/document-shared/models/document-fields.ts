import { DocumentFolderStat } from '../../models/Document';
import { fieldSettings } from './field-settings';

export interface documentFields {
    folderName: string;
    getEmployeeFieldSettings(): fieldSettings;
    getSiteFieldSettings(): fieldSettings;
    getSensitivityFieldSettings(): fieldSettings;
}