import {Component} from '@angular/core';
import {VideoUploaderModuleVideoUploaderOptions, UploadedFile} from 'ng-video-upload';

@Component({
  selector: 'home',
  styleUrls: ['./home.css'],
  templateUrl: './home.html'
})
export class Home {
  options: VideoUploaderModuleVideoUploaderOptions = {
      thumbnailHeight: 200,
      thumbnailWidth: 200,
      uploadUrl: 'https://video-uploader-demo.azurewebsites.net/api/demo/upload',
      allowedVideoTypes: ['video/png', 'video/jpeg'],
      maxVideoSize: 3
  };

  response: string;

  onUpload(file: UploadedFile) {
    this.response = file.response;
  }
}
