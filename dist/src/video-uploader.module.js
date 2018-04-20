import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoUploaderModuleVideoUploaderComponent } from './video-uploader.component';
import { FileUploader } from './file-uploader';
var VideoUploaderModule = (function () {
    function VideoUploaderModule() {
    }
    VideoUploaderModule.decorators = [
        { type: NgModule, args: [{
                    imports: [CommonModule],
                    providers: [FileUploader],
                    declarations: [VideoUploaderModuleVideoUploaderComponent],
                    exports: [VideoUploaderModuleVideoUploaderComponent]
                },] },
    ];
    /** @nocollapse */
    VideoUploaderModule.ctorParameters = function () { return []; };
    return VideoUploaderModule;
}());
export { VideoUploaderModule };
