import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public AWS_IAM_USER = "app_public";
  public BUCKET_NAME = "123";

  constructor(public navCtrl: NavController) {

  }

}
