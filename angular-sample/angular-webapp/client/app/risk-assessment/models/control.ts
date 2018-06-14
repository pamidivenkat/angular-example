import { ControlsCategory } from '../common/controls-category-enum';
export class Control {
    Id: string;
    CompanyId: string;
    Name: string;
    PictureId: string;
    Description: string;
    IsExample: boolean;
    Category: ControlsCategory;
}