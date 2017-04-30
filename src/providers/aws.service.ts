import { Injectable } from "@angular/core";

declare var AWS;

@Injectable()
export class AwsService {
    private _region = "eu-west-2"; //London
    //private _user = "app_public";
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
     * Upload file to Amazon S3
     * @param  {string} file_prefix
     * @param  {File} file
     * @param  {any} callback
     * @returns void
     */
    uploadFile(file_prefix: string, file: File, callback: any): void {
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

        s3.upload(params, (err, data) => {
            if(err) console.log("S3 upload error", err);
            else {
                console.log("S3 upload complete");
                callback(data);
            }
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