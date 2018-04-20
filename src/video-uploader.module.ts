import {NgModule} from '@angular/core'
import {CommonModule} from '@angular/common';
import {VideoUploaderModuleVideoUploaderComponent} from './video-uploader.component';
import {FileUploader} from './file-uploader';

@NgModule({
  imports: [CommonModule],
  providers: [FileUploader],
  declarations: [VideoUploaderModuleVideoUploaderComponent],
  exports     : [VideoUploaderModuleVideoUploaderComponent]
})
export class VideoUploaderModule {}
