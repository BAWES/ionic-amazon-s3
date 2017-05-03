import { Injectable } from "@angular/core";
import { Observable, Observer } from 'rxjs/rx';

declare var AWS;

@Injectable()
export class AwsService {
    private _region = "eu-west-2"; //London
    private _access_key_id = "AKIAI5ZFAKH7R3WIHWXQ";
    private _secret_access_key = "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";
    private _bucket_name = "bawes-public";

    constructor(){
        this.initAwsService();
    }

    /**
     * Initialize the AWS Service
     */
    initAwsService(){
        AWS.config.region = this._region;
        AWS.config.accessKeyId = this._access_key_id;
        AWS.config.secretAccessKey = this._secret_access_key;
    }

    /**
     * Upload file to Amazon S3, return an observable to monitor progress
     * @param  {string} file_prefix
     * @param  {File} file
     * @param  {any} callback
     * @returns {Observable<any>}
     */
    uploadFile(file_prefix: string, file: File): Observable<any> {
        let s3 = new AWS.S3({
            apiVersion: '2006-03-01'
        });

        let params = {
            Body: file, // the actual file file
            ACL: "public-read", // to allow public access to the file
            Bucket: this._bucket_name, //bucket name
            Key: file_prefix + "-" + Date.now() + "." + this._getFileExtension(file.name), //file name
            ContentType: file.type //(String) A standard MIME type describing the format of the object file
        }

        return Observable.create((observer: Observer<any>) => {
            s3.upload(params).on('httpUploadProgress', (progress: ProgressEvent) => {
                // console.log("AWS Progress: "+ JSON.stringify(progress));
                observer.next(progress);
            }).send((err, data) => {
                if(err) {
                    observer.error(err);
                }else {
                    observer.next(data);
                    observer.complete();
                }
            });
        });
    }

    /**
     * Take file name / path and return the file extension.
     */
    private _getFileExtension(path) {
        var basename = path.split(/[\\/]/).pop(),  // extract file name from full path ...
                                                // (supports `\\` and `/` separators)
            pos = basename.lastIndexOf(".");       // get last position of `.`

        if (basename === "" || pos < 1)            // if file name is empty or ...
            return "";                             //  `.` not found (-1) or comes first (0)

        return basename.slice(pos + 1);            // extract extension ignoring `.`
    }

}