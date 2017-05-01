import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AwsService } from '../../providers/aws.service'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public bucketUrl = "https://bawes-public.s3.eu-west-2.amazonaws.com/"; //filepref-1493644650543.png

  public uploads = [];

  constructor(
    public navCtrl: NavController,
    private _aws: AwsService
    ) {}

  /**
   * Login to upload the file
   */
  uploadFile($event){
    let fileList: FileList = $event.target.files;

    // Check if files available
    if(fileList.length > 0){
      let file: File = fileList.item(0);

      let newUpload = {
        name: file.name,
        status: "uploading",
        loaded: 0,
        total: file.size
      };
      this.uploads.push(newUpload);

      this._aws.uploadFile("filepref", file).subscribe((progress) => {
          console.log(progress);
          newUpload.status = "uploading";
          newUpload.loaded = progress.loaded;
          newUpload.total = progress.total;
          newUpload.name = progress.key;
        }, err => {
          console.log("Error", err);
          newUpload.status = "error";
        }, () => {
          console.log("Done uploading? Completed");
          newUpload.status = "complete";
        });
    }
    
  }

}
