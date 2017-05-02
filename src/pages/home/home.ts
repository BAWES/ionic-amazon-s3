import { Component, Renderer, ElementRef, ViewChild } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { Camera, CameraOptions } from '@ionic-native/camera';
import { File, Entry, FileEntry } from '@ionic-native/file';

import { AwsService } from '../../providers/aws.service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('fileInput') fileInput:ElementRef;

  public bucketUrl = "https://bawes-public.s3.eu-west-2.amazonaws.com/"; // Used for link generation after upload
  public cameraOptions: CameraOptions; // Default settings for camera app 
  public uploads = []; // List of uploads to display in this app

  constructor(
    public navCtrl: NavController,
    private _aws: AwsService,
    private _camera: Camera,
    private _file: File,
    private _platform: Platform,
    private _renderer:Renderer
  ) {
    // Set Default Camera Options
    this.setCameraOptions();
  }

  /**
   * Sets camera options based on the device plugin support
   */
  setCameraOptions(){
    this.cameraOptions = {
      quality: 100,
      allowEdit: true,
      destinationType: this._camera.DestinationType.FILE_URI,
      encodingType: this._camera.EncodingType.JPEG,
      mediaType: this._camera.MediaType.PICTURE
    };

    if(this._platform.is("android")){
      this.cameraOptions = {
        quality: 100,
        allowEdit: false,
        destinationType: this._camera.DestinationType.FILE_URI,
        encodingType: this._camera.EncodingType.JPEG,
        mediaType: this._camera.MediaType.PICTURE,
        correctOrientation: true
      };
    }
  }

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

  /**
   * Loads Camera to select file
   */
  selectFileFromCamera(){
    this._camera.getPicture(this.cameraOptions).then((imageData) => {
        console.log(imageData);

        // Resolve File Path on System 
        this._file.resolveLocalFilesystemUrl(imageData).then((entry: Entry) => {
          // Convert entry into File Entry which can output a JS File object
          let fileEntry =  entry as FileEntry;

          // Return a File object that represents the current state of the file that this FileEntry represents
          fileEntry.file((file) => {
            // Upload The File
            this.processFileUpload(file);
          }, (error) => {
            alert("Unable to retrieve file properties: " + error.code)
          });
        }).catch(err => { 
          alert("Error resolving file") 
        });

      }, (err) => {
        // Error getting picture
        alert(JSON.stringify(err));
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
      let file = fileList.item(0);
      // Upload The File
      this.processFileUpload(file);
    }
  }


  /**
   * Takes a JS File object for upload to S3
   */
  processFileUpload(file){
    let newUpload = {
      name: file.name,
      status: "uploading",
      loaded: 0,
      total: file.size,
      link: ''
    };
    this.uploads.push(newUpload);
    console.log(JSON.stringify(this.uploads));

    this._aws.uploadFile("filepref", file).subscribe((progress) => {
      console.log(JSON.stringify(progress));
      newUpload.status = "uploading";
      newUpload.loaded = progress.loaded;
      newUpload.total = progress.total;
      newUpload.name = progress.key? progress.key : progress.Key; // If Multipart upload (big file), Key with capital "K"
      newUpload.link = this.bucketUrl + newUpload.name;
    }, err => {
      console.log("Error", err);
      newUpload.status = "error";
    }, () => {
      console.log("Done uploading? Completed");
      newUpload.status = "complete";
    });
  }

}
