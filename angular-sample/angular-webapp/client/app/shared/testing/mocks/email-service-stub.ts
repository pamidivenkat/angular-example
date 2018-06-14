import { EmailModel } from "../../../email-shared/models/email.model";
import { Observable } from "rxjs/Observable";

export class EmailServiceStub {

    getEmailTemplate(emailModel: EmailModel): Observable<EmailModel> {
        let model = new EmailModel();
        model.TemplateId = '90F21C95-BD7C-4A04-852C-FA262617BF8D';
        model.Attachments.push({ DocumentId: '1234', IsExample: false, FileName: "" });
        model.References.push({ Id: 'ABC-123-XYZ', Name: 'User', Otc: null });
        model.Type = "Method Statement";
        return Observable.of(model);
    }
}
