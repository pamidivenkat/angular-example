import { BaseDocumentCategory } from '../models/base-document-categories';
import { documentFields } from '../models/document-fields';
import { Sensitivity } from '../../../shared/models/sensitivity';
import { fieldSettings } from '../models/field-settings';

export class CarePolicy extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'H&S document suite';
    }

    public getSiteFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = false;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }
}

export class Certificates extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'Training';
    }

    public getEmployeeFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = false;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }

    public getSensitivityFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = true;
        let defaultValue: any = Sensitivity.Basic;
        return new fieldSettings(visibility, mandatory, defaultValue);
    }

}
export class Checklist extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'H&S document suite';
    }
    public getSiteFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = false;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }
}
export class CompanyPolicy extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'Company policies';
    }

    public getSiteFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = false;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }

}

export class ConstructionPhasePlan extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'H&S document suite';
    }

    public getSiteFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = false;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }
}
export class Contract extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'Starters & leavers';
    }

    public getEmployeeFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = false;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }
}


export class Coshh extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'H&S document suite';
    }

    public getSiteFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = false;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }
}

export class Dbs extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = "";
    }

    public getSiteFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = true;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }
}

export class Disciplinary extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'Disciplinaries & grievances';
    }

    public getEmployeeFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = true;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }

    public getSensitivityFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = true;
        let defaultValue: any = Sensitivity.Sensitive;
        return new fieldSettings(visibility, mandatory, defaultValue);
    }

}

export class Email extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'Other';
    }
}

export class File extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'Other';
    }
}

export class FireRiskAssessment extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'H&S document suite';
    }

    public getSiteFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = true;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }

}

export class General extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'General';
    }

    public getEmployeeFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = false;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }

    getSensitivityFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = true;
        let defaultValue: any = Sensitivity.Basic;
        return new fieldSettings(visibility, mandatory, defaultValue);
    }

}

export class Grievance extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'Disciplinaries & grievances';
    }

    public getEmployeeFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = true;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }

    public getSensitivityFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = true;
        let defaultValue: any = Sensitivity.Sensitive;
        return new fieldSettings(visibility, mandatory, defaultValue);
    }
}

export class IncidentLog extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'H&S document suite';
    }

    public getSiteFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = false;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }

}

export class Leaver extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'Starters & leavers';
    }

    public getEmployeeFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = true;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }

    public getSensitivityFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = true;
        let defaultValue: any = Sensitivity.Basic;
        return new fieldSettings(visibility, mandatory, defaultValue);
    }
}

export class MethodStatement extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'H&S document suite';
    }

    public getSiteFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = false;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }
}
export class NewStarter extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'Starters & leavers';
    }

    public getEmployeeFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = false;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }

    public getSensitivityFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = true;
        let defaultValue: any = Sensitivity.Basic;
        return new fieldSettings(visibility, mandatory, defaultValue);
    }
}

export class Other extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'Other';
    }
}

export class PerformanceReview extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'Appraisal & reviews';
    }

    public getEmployeeFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = true;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }

    public getSensitivityFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = true;
        let defaultValue: any = Sensitivity.Advance;
        return new fieldSettings(visibility, mandatory, defaultValue);
    }
}
export class Performance extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'Appraisal & reviews';
    }

    public getEmployeeFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = false;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }

    public getSensitivityFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = true;
        let defaultValue: any = Sensitivity.Advance;
        return new fieldSettings(visibility, mandatory, defaultValue);
    }
}

export class PersonalDocument extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'General';
    }

    public getEmployeeFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = true;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }

    public getSensitivityFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = true;
        let defaultValue: any = Sensitivity.Sensitive;
        return new fieldSettings(visibility, mandatory, defaultValue);
    }
}

export class RiskAssessment extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'H&S document suite';
    }

    public getSiteFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = false;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }
}

export class ScannedDocument extends BaseDocumentCategory implements documentFields {
    public folderName: string;

    constructor() {
        super();
        this.folderName = 'Other';
    }

    public getEmployeeFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = false;
        let defaultValue: any = "";
        return new fieldSettings(visibility, mandatory, defaultValue);
    }

    public getSensitivityFieldSettings(): fieldSettings {
        let visibility: boolean = true;
        let mandatory: boolean = true;
        let defaultValue: any = Sensitivity.Basic;
        return new fieldSettings(visibility, mandatory, defaultValue);
    }

}