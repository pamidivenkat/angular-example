export class TrainingcoursesModel {
    private _Id: string;
    private _ModuleTitle: string;
     private _CourseTitle: string;

    get Id(): string {
        return this._Id;
    }
    set Id(value: string) {
        this._Id = value;
    }
    get ModuleTitle(): string {
        return this._ModuleTitle;
    }
    set ModuleTitle(value: string) {
        this._ModuleTitle = value;
    }

 get CourseTitle(): string {
        return this._CourseTitle;
    }
    set CourseTitle(value: string) {
        this._CourseTitle = value;
    }

    constructor(id:string, moduleTitle:string, courseTitle:string){
        this._Id = id;
        this._ModuleTitle = moduleTitle;
        this._CourseTitle = courseTitle;
    }
}
