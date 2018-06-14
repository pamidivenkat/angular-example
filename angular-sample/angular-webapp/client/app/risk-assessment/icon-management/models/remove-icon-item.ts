
export class IconType {
    Type: string;
}
export class IconItem<T> extends IconType {
    Entity: T;
    Type: string;
}

export class BulkIcons extends IconType {
    Icons: Array<string>;
    Type: string;
}