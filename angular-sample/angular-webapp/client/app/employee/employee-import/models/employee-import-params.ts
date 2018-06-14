export class EmployeeImportParams {
    FileStorageIdentifier: string;
    FileName: string;
    constructor(__filename: string, _fileStorageIdentifier: string) {
        this.FileName = __filename;
        this.FileStorageIdentifier = _fileStorageIdentifier;
    }
}