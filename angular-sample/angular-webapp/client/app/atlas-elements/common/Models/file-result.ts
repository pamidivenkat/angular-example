export class FileResult {
  public file: File;
  public header: string;
  public isValid: boolean;
  // tslint:disable-next-line:max-line-length
  constructor(file: File, header?: string, isValid?: boolean) {
    this.file = file;
    this.header = header;
    this.isValid = isValid;
  }
}
