import { Injectable } from "@angular/core";

declare var AWS;

@Injectable()
export class AwsService {
    private _region = "eu-west-1";
    private _user = "app_public";
    private _access_key_id = "AKIAI5ZFAKH7R3WIHWXQ";
    private _secret_access_key = "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";
    private _bucket_name = "app_public";

    constructor(){
        this.initAwsService();
    }

    /**
     * Initialize the AWS Service
     */
    initAwsService(){
        AWS.config.region = this._region;
    }

    /**
     * Upload file to Amazon S3
     * @param  {string} file_prefix
     * @param  {string} data
     * @param  {any} cb
     * @returns void
     */
    uploadFile(file_prefix: string, data: string, cb: any): void {
        
        let remoteFileName = file_prefix + "-" + Date.now() + ".csv";
        let s3 = new AWS.S3({
            apiVersion: '2006-03-01',
            params: {Bucket: this._bucket_name}
        });

        s3.upload({Body: data, Key: remoteFileName}, (err, data) => {
        if(err) console.log("S3 upload error", err);
        else {
            console.log("S3 upload complete");
            cb();
        }
        });
    }

}