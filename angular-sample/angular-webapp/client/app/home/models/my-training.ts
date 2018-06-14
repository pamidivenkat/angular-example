import { Document } from '../../document/models/document';

export class MyTraining {
    private _id: string;
    private _courseTitle: string;
    private _moduleTitle: string;
    private _passDate: Date;
    private _startDate: Date;
    private _status: number;
    private _certificates: Array<Document>;
    private _link: string;

    get Id(): string {
        return this._id;
    }
    set Id(value: string) {
        this._id = value;
    }

    get CourseTitle(): string {
        return this._courseTitle;
    }
    set CourseTitle(value: string) {
        this._courseTitle = value;
    }

    get ModuleTitle(): string {
        return this._moduleTitle;
    }
    set ModuleTitle(value: string) {
        this._moduleTitle = value;
    }

    get PassDate(): Date {
        return this._passDate;
    }
    set PassDate(value: Date) {
        this._passDate = value;
    }

    get StartDate(): Date {
        return this._startDate;
    }
    set StartDate(value: Date) {
        this._startDate = value;
    }

    get Status(): number {
        return this._status;
    }
    set Status(value: number) {
        this._status = value;
    }
    get Certificates() {
        return this._certificates;
    }
    set Certificates(value: Array<Document>) {
        this._certificates = value;
    }

    get Link(): string {
        return this._link;
    }

    set Link(link: string) {
        this._link = link;
    }

    constructor(obj: any) {
        Object.assign(this, obj);
    }
}
