export class KeyDocuments {
    private _id: string;
    private _categoryName: string;
    private _fileStorageIdentifier: string;
    private _category: number;
    private _documentVersion;

    get DocumentVersion(): string {
        return this._documentVersion;
    }
    set DocumentVersion(value: string) {
        this._documentVersion = value;
    }

    get Id(): string {
        return this._id;
    }
    set Id(value: string) {
        this._id = value;
    }
    get Category(): number {
        return this._category;
    }
    set Category(value: number) {
        this._category = value;
    }
    get CategoryName(): string {
        return this._categoryName;
    }
    set CategoryName(value: string) {
        this._categoryName = value;
    }

    get FileStorageIdentifier(): string {
        return this._fileStorageIdentifier;
    }
    set FileStorageIdentifier(value: string) {
        this._fileStorageIdentifier = value;
    }

    constructor(id: string, name: string, fileStorageIdentifier: string) {
        this._id = id;
        this.CategoryName = name;
        this._fileStorageIdentifier = fileStorageIdentifier;
    }
}
