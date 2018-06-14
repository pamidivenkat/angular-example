export class ChartData {
    Value: number;
    Color: string;
    Text: string;
    Class: string;

    constructor(value: number, color: string, text: string, classStyle: string) {
        this.Value = value;
        this.Color = color;
        this.Text = text;
        this.Class = classStyle;
    }
}