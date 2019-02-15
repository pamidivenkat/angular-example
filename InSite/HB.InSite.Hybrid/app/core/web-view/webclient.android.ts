import * as imagepicker from 'nativescript-imagepicker';
import * as fs from 'tns-core-modules/file-system';

export class MyWebChromeClient extends android.webkit.WebChromeClient {
    file_path: string;

    constructor() {
        super();
        return global.__native(this);
    }

    onShowFileChooser(webView, filePathCallback, fileChooserParams) {
        console.log('onShowFileChooser', webView, filePathCallback);
        this.filepathCallback(filePathCallback);

        return true;
    }

    filepathCallback(filePathCallback) {
        let context = imagepicker.create({
            mode: "single",
            mediaType: imagepicker.ImagePickerMediaType.Any
        });
        this.startSelection(context, filePathCallback);
    }

    startSelection(context, filePathCallback) {
        console.log('startSelection', context, filePathCallback);
        context.authorize().then(() => {
            return context.present();
        })
            .then((selection) => {
                selection.forEach((selected) => {
                    let path = selected.android;
                    let file = fs.File.fromPath(path);
                    this.file_path = file.path;
                    this.file_path = "file://" + this.file_path;
                    let results = Array.create(android.net.Uri, 1);
                    results[0] = android.net.Uri.parse(this.file_path);

                    filePathCallback.onReceiveValue(results);
                    return this.file_path;
                });
            }).catch(function(e) {
            console.log(e);
        });
    }
}