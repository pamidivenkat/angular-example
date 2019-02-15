import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { isAndroid } from "platform";
import { Page } from "tns-core-modules/ui/page/page";
import fs = require("file-system");

declare var java: any;
declare var NSFileManager: any;
declare var NSFileSize: any;

@Component({
    selector: 'choose-file',
    templateUrl: "choosefile/choose_file.component.html",
    styleUrls: ["choosefile/choose_file.component.css"]
})
export class ChooseFile implements OnInit {

    @Input() parent;
    @ViewChild("locationPath") locationPath: ElementRef;
    public locationPathNE;
    public listOfFilesAndFolders: fsData[] = [];
    public currentDirectory: string = '/sdcard';
    public startPath: string;
    public customPath: string;
    public maxSize: number;
    //extenstions priority is more than ignoreExtensions
    //list of extensions we want to show
    public extensions: string;

    //list of extensions we want to ignore
    public ignoreExtensions: string;
    private _params: any;

    constructor(
        private page: Page,
        private _changeDetectionRef: ChangeDetectorRef
    ) {
        this.listOfFilesAndFolders = [];
    }

    @Input()
    public params(value) {
        this._params = value;
        this.customPath = this.startPath = value.context.startPath;
        this.maxSize = value.context.maxSize;
        this.extensions = value.context.extensions.map((value) => value.toUpperCase());
        this.ignoreExtensions = value.context.ignoreExtensions.map((value) => value.toUpperCase());
    }

    private onItemTap(args) {
        let item = this.listOfFilesAndFolders[args.index];
        if (item.isBackButton)
            return this.back();
        let path = item.path;

        if (!item.isFile) {
            this.refreshList(path);
        } else {
            this.parent.onSelectedFile(item.path);
        }
    }

    public ngOnInit() {
    }

    ngAfterContentInit() {
        this.locationPathNE = this.locationPath.nativeElement;
        this.locationPathNE.text = fs.knownFolders.documents().path;
        this.refreshList(this.startPath);
    }

    private back() {

        let file = new java.io.File(this.currentDirectory);

        if (file.getParent() != null) {
            let parent = file.getParent();
            this.refreshList(parent);
        }

    }

    public isFolder(item) {
        return item.isKnown !== undefined || item.extension === undefined || item.isLocked === undefined;
    }

    private refreshList(path: string) {
        path = path ? path : this.locationPathNE.text;
        this.customPath = this.currentDirectory = path;
        console.log(this.currentDirectory);
        this.listOfFilesAndFolders = [];
        //two lists for files and folders to show folders first then files
        let listOfFiles: fsData[] = [];
        let listOfFolders: fsData[] = [];
        let filesAndFolders = fs.Folder.fromPath(path);

        filesAndFolders.eachEntity((entity) => {
            if (!fs.File.exists(entity.path)) return true;
            let file = fs.File.fromPath(entity.path);
            let fileAndroid = new java.io.File(entity.path);
            if (!fileAndroid.canRead() || fileAndroid.isHidden())
                return true;

            let ent;

            if (!this.isFolder(entity)) {
                let ext = entity.path.split('.').slice(-1)[0];
                //If extensions property used
                if (this.extensions && this.extensions.length > 0) {
                    //if not ext exist in extensions
                    if (this.extensions.indexOf(ext.toUpperCase()) < 0)
                        return true;
                } else if (this.ignoreExtensions && this.ignoreExtensions.length > 0) {
                    //If ignoreExtensions property used
                    if (this.ignoreExtensions.indexOf(ext.toUpperCase()) >= 0) {
                        return true;
                    }
                }

                if (isAndroid && fileAndroid) {
                    var length = fileAndroid.length();
                    var lengthB = length / 1024;
                    if (this.maxSize < length) return true;
                } else {
                    var defManager = NSFileManager.defaultManager;
                    var fileAttributes = defManager.attributesOfItemAtPathError(entity.path);
                    var fileSizeNumber = fileAttributes.objectForKey(NSFileSize);
                    var fileSizeNumberB = fileSizeNumber / 1000;
                    if (this.maxSize < fileSizeNumber)
                        return true;
                }

                ent = new fsData();
                ent.isFile = true;
                listOfFiles.push(ent);
            } else {
                ent = new fsData();
                ent.isFile = false;
                listOfFolders.push(ent);
            }

            ent.name = entity.name;
            ent.path = entity.path;
            ent.isBackButton = false;


            return true;
        });

        let backButton = new fsData();
        backButton.name = "..";
        backButton.isFile = false;
        backButton.path = null;
        backButton.isBackButton = true;

        this.listOfFilesAndFolders = listOfFolders.concat(listOfFiles);
        this.listOfFilesAndFolders.unshift(backButton);
    }

}

class fsData {
    public name: string;
    public isFile: boolean;
    public path: string;
    public isBackButton: boolean = false;

}