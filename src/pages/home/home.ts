import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AwsService } from '../../providers/aws.service'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public file: File;

  public uploadedFileData: {
    Key: string;
    Location: string;
  };

  constructor(
    public navCtrl: NavController,
    private _aws: AwsService
    ) {

  }

  /**
   * Login to upload the file
   */
  uploadFile($event){
    let fileList: FileList = $event.target.files;

    // Check if files available
    if(fileList.length > 0){
      let file: File = fileList.item(0);
      console.log(file.name);

      this._aws.uploadFile("filepref", file, (data) => {
        this.uploadedFileData = data;
      });
    }
    
  }

}
