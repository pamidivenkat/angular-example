export class COSHHInventory {
    Id: string;
    Substance: string;
    Description: string;
    Manufacturer: string;
    Quantity: string;
    UsedFor: string;
    ExposureLimits: string;
    ReferenceNumber: string;
    IsExample: boolean;
    CompanyId: string;
    AttachmentId: string;

    constructor() {
        this.Id = '';
        this.Substance = '';
        this.Description = '';
        this.Manufacturer = '';
        this.Quantity = '';
        this.UsedFor = '';
        this.ExposureLimits = '';
        this.ReferenceNumber = '';
        this.IsExample = false;
        this.CompanyId = '';
        this.AttachmentId = '';
    }
}
