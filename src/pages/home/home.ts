import { Component, Renderer, ElementRef, ViewChild, NgZone } from '@angular/core';
import { NavController, Platform, ActionSheetController } from 'ionic-angular';

// Services
import { AwsService } from '../../providers/aws.service';
import { CameraService } from '../../providers/camera.service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('fileInput') fileInput:ElementRef;

  public bucketUrl = "https://bawes-public.s3.eu-west-2.amazonaws.com/"; // Used for link generation after upload
  public uploads = []; // List of uploads to display in this app

  constructor(
    public navCtrl: NavController,
    private _actionSheetCtrl: ActionSheetController,
    private _awsService: AwsService,
    private _cameraService: CameraService,
    private _platform: Platform,
    private _renderer:Renderer,
    private _zone: NgZone
  ) {}

  /**
   * Upload Photo button clicked
   * - On Native device, load native camera/gallery
   * - On Browser, trigger a click on the html file input
   */
  uploadBtnClicked(){
    if(this._platform.is("cordova")){
      // Display action sheet giving user option of camera vs local filesystem.
      let actionSheet = this._actionSheetCtrl.create({
        title: "Select image source",
        buttons: [
          {
            text: 'Load from Library',
            handler: () => {
              this._cameraService.getImageFromLibrary().then((nativeImageFilePath) => {

                  // Create Transfer Record for Display 
                  let newUpload = {
                    name: "Preparing file for upload",
                    status: "uploading",
                    loaded: 0,
                    total: 100,
                    link: ''
                  };
                  this.uploads.push(newUpload);
                  // Upload and process for progress
                  let uploadObservable = this._awsService.uploadNativePath("camera", nativeImageFilePath);
                  this.processFileUpload(uploadObservable, newUpload);

              }, (err) => {
                  // Error getting picture
                  alert("Error getting picture from Library: " + JSON.stringify(err));
                  console.log("Error getting picture from Library: " + JSON.stringify(err));
              });;
            }
          },
          {
            text: 'Use Camera',
            handler: () => {
              this._cameraService.getImageFromCamera().then((nativeImageFilePath) => {


                  // Create Transfer Record for Display 
                  let newUpload = {
                    name: "Preparing file for upload",
                    status: "uploading",
                    loaded: 0,
                    total: 100,
                    link: ''
                  };
                  this.uploads.push(newUpload);
                  // Upload and process for progress
                  let uploadObservable = this._awsService.uploadNativePath("camera", nativeImageFilePath);
                  this.processFileUpload(uploadObservable, newUpload);



              }, (err) => {
                  // Error getting picture
                  alert("Error getting picture from Camera: " + JSON.stringify(err));
                  console.log("Error getting picture from Camera: " + JSON.stringify(err));
              });;
            }
          }
        ]
      });
      actionSheet.present();

    }else{
      // Trigger click event on regular HTML file input
      let event = new MouseEvent('click', {bubbles: true});
      this._renderer.invokeElementMethod(this.fileInput.nativeElement, 'dispatchEvent', [event]);
    }
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

      // Create Transfer Record for Display 
      let newUpload = {
        name: file.name,
        status: "uploading",
        loaded: 0,
        total: file.size,
        link: ''
      };
      this.uploads.push(newUpload);

      // Upload The File
      let uploadObservable = this._awsService.uploadFile("browserpref", file);
      this.processFileUpload(uploadObservable, newUpload);
    }
  }


  /**
   * Takes a JS File object for upload to S3
   */
  processFileUpload(uploadObservable, newUpload){
    

    // Process Uploads
    uploadObservable.subscribe((progress) => {

      // Run in zone to trigger change detection
      // this._zone.run(() => {
        // If Progress has a loaded value, update progress
        if(progress.loaded &&  progress.loaded != progress.total){
            newUpload.status = "uploading";
            newUpload.loaded = progress.loaded;
            newUpload.total = progress.total;
        }

        // If Multipart upload (big file), Key with capital "K"
        if(progress.key || progress.Key){
          newUpload.name = progress.key? progress.key : progress.Key; 
          newUpload.link = this.bucketUrl + newUpload.name;
        }

      // });
      
    }, (err) => {
      // console.log("Error", err);
      // this._zone.run(() => {
        newUpload.status = "error";
      // });
    }, () => {
      // console.log("Done uploading / Completed");
      // this._zone.run(() => {
        newUpload.status = "complete";
      // });
    });
  }

  

}
