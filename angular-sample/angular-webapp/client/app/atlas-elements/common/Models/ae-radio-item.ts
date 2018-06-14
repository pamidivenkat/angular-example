export class AeRadioItem {
    Id:string;
    Text: string;
    Value: boolean;
    Disabled: boolean;
    constructor(init?: any)    {
        this.Disabled = false;
        Object.assign(this, init);
    }
}
