import { Component, Renderer, ElementRef, ViewChild } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { Camera, CameraOptions } from '@ionic-native/camera';

import { AwsService } from '../../providers/aws.service'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('fileInput') fileInput:ElementRef;

  public bucketUrl = "https://bawes-public.s3.eu-west-2.amazonaws.com/";

  public uploads = [];

  constructor(
    public navCtrl: NavController,
    private _aws: AwsService,
    private _camera: Camera,
    private _platform: Platform,
    private _renderer:Renderer
    ) {}


  /**
   * Upload Photo button clicked
   * - On Native device, load native camera/gallery
   * - On Browser, trigger a click on the html file input
   */
  uploadBtnClicked(){
    if(this._platform.is("cordova")){
      this.selectFileFromCamera();
    }else{
      // Trigger click event on regular HTML file input
      let event = new MouseEvent('click', {bubbles: true});
      this._renderer.invokeElementMethod(
          this.fileInput.nativeElement, 'dispatchEvent', [event]);
    }
  }

  selectFileFromCamera(){
    const options: CameraOptions = {
      quality: 100,
      allowEdit: true,
      destinationType: this._camera.DestinationType.FILE_URI,
      encodingType: this._camera.EncodingType.JPEG,
      mediaType: this._camera.MediaType.PICTURE
    };

    this._camera.getPicture(options).then((imageData) => {
        console.log(imageData);
      }, (err) => {
        console.log(err);
    });
  }

  /**
   * Upload the selected file through regular HTML file input 
   * This method will only be called if the target is not a cordova app.
   */
  uploadFileViaHtmlFileInput($event){
    let fileList: FileList = $event.target.files;

    // Check if files available
    if(fileList.length > 0){
      let file: File = fileList.item(0);

      let newUpload = {
        name: file.name,
        status: "uploading",
        loaded: 0,
        total: file.size,
        link: ''
      };
      this.uploads.push(newUpload);

      this._aws.uploadFile("filepref", file).subscribe((progress) => {
          //console.log(progress);
          newUpload.status = "uploading";
          newUpload.loaded = progress.loaded;
          newUpload.total = progress.total;
          newUpload.name = progress.key? progress.key : progress.Key; // If Multipart upload (big file), Key with capital "K"
          newUpload.link = this.bucketUrl + newUpload.name;
        }, err => {
          //console.log("Error", err);
          newUpload.status = "error";
        }, () => {
          //console.log("Done uploading? Completed");
          newUpload.status = "complete";
        });
    }
  }

}
