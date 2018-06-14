export class AeSelectItem<T> {
    Text: string;
    Value: T;
    Childrens:AeSelectItem<T>[];
    Disabled:boolean=false;

    constructor(text?:string,value?:T,disabled:boolean = false){
        this.Text = text;
        this.Value = value;
        this.Disabled = disabled;
    }
}