# VideoUploaderModule Video Uploader [![npm version](https://badge.fury.io/js/ng-video-upload.svg)](https://badge.fury.io/js/ng-video-upload) ![Dependencies](https://david-dm.org/TheSkyNet/ng-video-upload.svg)

Angular2 component that uploads selected or dropped video asynchronously with preview.

### Demo
See demo here: [demo](https://TheSkyNet.github.io/video-uploader-demo)

### Install
```
npm install ng-video-upload --save
```
### Usage

Add video uploader module to your module's ```imports```

```js
import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { AppComponent } from './app';

import { VideoUploaderModule } from 'ng-video-upload';

@NgModule({
  imports: [BrowserModule, VideoUploaderModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

Use it in your component

```js
import { Component } from '@angular/core';
import { VideoUploaderModuleVideoUploaderOptions, UploadedFile } from 'ng-video-upload';

@Component({
  selector: 'example-app',
  template: '<video-uploader [options]="options" (onUpload)="onUpload($event)"></video-uploader>'
})
export class AppComponent {
  options: VideoUploaderModuleVideoUploaderOptions = {
      thumbnailHeight: 150,
      thumbnailWidth: 150,
      uploadUrl: 'http://some-server.com/upload',
      allowedVideoTypes: ['video/mp4'],
      maxVideoSize: 3
  };
  
  onUpload(file: UploadedFile) {
    console.log(file.response);
  }
}

```

### License

[MIT](https://tldrlegal.com/license/mit-license) © [Olegas Gončarovas](https://github.com/TheSkyNet)
