export class AeAutoCompleteModel<T>{
    Text: string;
    Value: string;
    Entity: T;

    constructor(text: string, value: string, entity: T) {
        this.Text = text;
        this.Value = value;
        this.Entity = entity;
    }
}