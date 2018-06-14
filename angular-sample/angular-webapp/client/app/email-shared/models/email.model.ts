import { AssignUser } from "../../task/models/assign-user";

export class EmailModel {
    References: EmailReference[];
    TemplateId: string;
    Attachments: EmailAttachment[];
    Body: string;
    From: any;
    To: any;
    Cc: any;
    Subject: string;
    Type : string;

    constructor() {
        this.References = [];
        this.TemplateId = '';
        this.Attachments = [];
        this.Body = null;
        this.From = null;
        this.To = null;
        this.Cc = null;
        this.Subject = null;
        this.Type = null;
    }
}

export class EmailReference {
    Id: string;
    Name: string;
    Otc: string;
    constructor() {
        this.Id = "";
        this.Name = "";
        this.Otc = null;
    }
}

export class EmailAttachment {
    FileName: string;
    DocumentId: string;
    IsExample: boolean;
    constructor() {
        this.FileName = "";
        this.DocumentId = "";
        this.IsExample = false;
    }
}

export class User {
    Id: string;
    FirstName: string;
    LastName: string;
    HasEmail: boolean;
    Email: string;
    FullName: string;
    constructor(id: string, firstName: string, lastName: string, hasEmail: boolean, email: string) {
        this.Id = id;
        this.FirstName = firstName;
        this.LastName = lastName;
        this.Email = email;
        this.HasEmail = hasEmail;
        this.FullName = this.FirstName + ' ' + this.LastName;
    }
}
