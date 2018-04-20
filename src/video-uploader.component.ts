import {Component, OnInit, OnDestroy, AfterViewChecked, ViewChild, ElementRef, Renderer, Input, Output, EventEmitter, ChangeDetectorRef, forwardRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {VideoUploaderModuleVideoUploaderOptions, VideoResult, ResizeOptions} from './interfaces';
import {createVideo, resizeVideo} from './utils';
import {FileUploader} from './file-uploader';
import {UploadedFile} from './uploaded-file';
import 'rxjs/add/operator/filter';
import * as Cropper from 'cropperjs';
import {CropOptions} from './interfaces';
import {cssTemplate, htmlTemplate} from './template';

export enum Status {
  NotSelected,
  Selected,
  Uploading,
  Loading,
  Loaded,
  Error
}

@Component({
  selector: 'video-uploader',
  template: htmlTemplate,
  styles: [cssTemplate],
  host: {
    '[style.width]': 'thumbnailWidth + "px"',
    '[style.height]': 'thumbnailHeight + "px"',
    '(drop)': 'drop($event)',
    '(dragenter)': 'dragenter($event)',
    '(dragover)': 'dragover($event)',
    '(dragleave)': 'dragleave($event)',
  },
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VideoUploaderModuleVideoUploaderComponent),
      multi: true
    }
  ]
})
export class VideoUploaderModuleVideoUploaderComponent implements OnInit, OnDestroy, AfterViewChecked, ControlValueAccessor {
  statusEnum = Status;
  _status: Status = Status.NotSelected;

  thumbnailWidth: number = 150;
  thumbnailHeight: number = 150;
  _videoThumbnail: any;
  _errorMessage: string;
  progress: number;
  propagateChange = (_: any) => {};
  origVideoWidth: number;
  orgiVideoHeight: number;

  cropper: Cropper = undefined;
  fileToUpload: File;

  @ViewChild('videoElement') videoElement: ElementRef;
  @ViewChild('fileInput') fileInputElement: ElementRef;
  @ViewChild('dragOverlay') dragOverlayElement: ElementRef;
  @Input() options: VideoUploaderModuleVideoUploaderOptions;
  @Output() onUpload: EventEmitter<UploadedFile> = new EventEmitter<UploadedFile>();
  @Output() onStatusChange: EventEmitter<Status> = new EventEmitter<Status>();

  constructor(
    private renderer: Renderer,
    private uploader: FileUploader,
    private changeDetector: ChangeDetectorRef) { }

  get videoThumbnail() {
    return this._videoThumbnail;
  }

  set videoThumbnail(value) {
    this._videoThumbnail = value;
    this.propagateChange(this._videoThumbnail);

    if (value !== undefined) {
      this.status = Status.Selected
    } else {
      this.status = Status.NotSelected;
    }
  }

  get errorMessage() {
    return this._errorMessage;
  }

  set errorMessage(value) {
    this._errorMessage = value;

    if (value) {
      this.status = Status.Error;
    } else {
      this.status = Status.NotSelected;
    }
  }

  get status() {
    return this._status;
  }

  set status(value) {
    this._status = value;
    this.onStatusChange.emit(value);
  }

  writeValue(value: any) {
    if (value) {
      this.loadAndResize(value);
    } else {
      this._videoThumbnail = undefined;
      this.status = Status.NotSelected;
    }
  }

  registerOnChange(fn: (_: any) => void) {
    this.propagateChange = fn;
  }

  registerOnTouched() {}

  ngOnInit() {
    if (this.options) {
      if (this.options.thumbnailWidth) {
        this.thumbnailWidth = this.options.thumbnailWidth;
      }
      if (this.options.thumbnailHeight) {
        this.thumbnailHeight = this.options.thumbnailHeight;
      }
      if (this.options.resizeOnLoad === undefined) {
        this.options.resizeOnLoad = true;
      }
      if (this.options.autoUpload === undefined) {
        this.options.autoUpload = true;
      }
      if (this.options.cropEnabled === undefined) {
        this.options.cropEnabled = false;
      }

      if (this.options.autoUpload && this.options.cropEnabled) {
        throw new Error('autoUpload and cropEnabled cannot be enabled simultaneously');
      }
    }
  }

  ngAfterViewChecked() {
    if (this.options && this.options.cropEnabled && this.videoElement && this.fileToUpload && !this.cropper) {
      this.cropper = new Cropper(this.videoElement.nativeElement, {
        viewMode: 1,
        aspectRatio: this.options.cropAspectRatio ? this.options.cropAspectRatio : null
      });
    }
  }

  ngOnDestroy() {
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }
  }

  loadAndResize(url: string) {
    this.status = Status.Loading;

    this.uploader.getFile(url, this.options).subscribe(file => {
      if (this.options.resizeOnLoad) {
        // thumbnail
        let result: VideoResult = {
          file: file,
          url: URL.createObjectURL(file)
        };

        this.resize(result).then(r => {
          this._videoThumbnail = r.resized.dataURL;
          this.status = Status.Loaded;
        });
      } else {
        let result: VideoResult = {
          file: null,
          url: null
        };

        this.fileToDataURL(file, result).then(r => {
          this._videoThumbnail = r.dataURL;
          this.status = Status.Loaded;
        });
      }
    }, error => {
      this.errorMessage = error || 'Error while getting an video';
    });
  }

  onVideoClicked() {
    this.renderer.invokeElementMethod(this.fileInputElement.nativeElement, 'click');
  }

  onFileChanged() {
    let file = this.fileInputElement.nativeElement.files[0];
    if (!file) return;

    this.validateAndUpload(file);
  }

  validateAndUpload(file: File) {
    this.propagateChange(null);

    if (this.options && this.options.allowedVideoTypes) {
      if (!this.options.allowedVideoTypes.some(allowedType => file.type === allowedType)) {
        this.errorMessage = 'Only these video types are allowed: ' + this.options.allowedVideoTypes.join(', ');
        return;
      }
    }

    if (this.options && this.options.maxVideoSize) {
      if (file.size > this.options.maxVideoSize * 1024 * 1024) {
        this.errorMessage = `Video must not be larger than ${this.options.maxVideoSize} MB`;
        return;
      }
    }

    this.fileToUpload = file;

    if (this.options && this.options.autoUpload) {
      this.upload();
    }

    // thumbnail
    let result: VideoResult = {
      file: file,
      url: URL.createObjectURL(file)
    };

    this.resize(result).then(r => {
      this._videoThumbnail = r.resized.dataURL;
      this.origVideoWidth = r.width;
      this.orgiVideoHeight = r.height;

      if (this.options && !this.options.autoUpload) {
        this.status = Status.Selected;
      }
    });
  }

  upload() {
    this.progress = 0;
    this.status = Status.Uploading;

    let cropOptions: CropOptions = undefined;

/*    if (this.cropper) {
      let scale = this.origVideoWidth / this.cropper.getVideoData().naturalWidth;
      let cropData = this.cropper.getData();

      cropOptions = {
        x: Math.round(cropData.x * scale),
        y: Math.round(cropData.y * scale),
        width: Math.round(cropData.width * scale),
        height: Math.round(cropData.height * scale)
      };
    }*/

    let id = this.uploader.uploadFile(this.fileToUpload, this.options, cropOptions);

    // file progress
    let sub = this.uploader.fileProgress$.filter(file => file.id === id).subscribe(file => {
      this.progress = file.progress;

      if (file.error) {
        if (file.status || file.statusText) {
          this.errorMessage = `${file.status}: ${file.statusText}`;
        } else {
          this.errorMessage = 'Error while uploading'
        }
        // on some upload errors change detection does not work, so we are forcing manually
        this.changeDetector.detectChanges();
      }

      if (file.done) {
        // notify that value was changed only when video was uploaded and no error
        if (!file.error) {
          this.propagateChange(this._videoThumbnail);
          this.status = Status.Selected;
          this.fileToUpload = undefined;
        }
        this.onUpload.emit(file);
        sub.unsubscribe();
      }
    });
  }

  removeVideo() {
    this.fileInputElement.nativeElement.value = null;
    this.videoThumbnail = undefined;

    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }
  }

  dismissError() {
    this.errorMessage = undefined;
    this.removeVideo();
  }

  drop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!e.dataTransfer || !e.dataTransfer.files.length) {
      return;
    }
    
    this.validateAndUpload(e.dataTransfer.files[0]);    
    this.updateDragOverlayStyles(false);
  }

  dragenter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  dragover(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.updateDragOverlayStyles(true);
  }

  dragleave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.updateDragOverlayStyles(false);
  }

  private updateDragOverlayStyles(isDragOver: boolean) {
    // TODO: find a way that does not trigger dragleave when displaying overlay
    // if (isDragOver) {
    //  this.renderer.setElementStyle(this.dragOverlayElement.nativeElement, 'display', 'block');
    // } else {
    //  this.renderer.setElementStyle(this.dragOverlayElement.nativeElement, 'display', 'none');
    // }
  }

  private resize(result: VideoResult): Promise<VideoResult> {
    let resizeOptions: ResizeOptions = {
      resizeHeight: this.thumbnailHeight,
      resizeWidth: this.thumbnailWidth,
      resizeType: result.file.type,
      resizeMode: this.options.thumbnailResizeMode
    };

    return new Promise((resolve) => {
      createVideo(result.url, video => {
        let dataUrl = resizeVideo(video, resizeOptions);
        
        result.width = video.width;
        result.height = video.height;
        result.resized = {
          dataURL: dataUrl,
          type: this.getType(dataUrl)
        };

        resolve(result);
      });
    });
  }

  private getType(dataUrl: string) {
    return dataUrl.match(/:(.+\/.+;)/)[1];
  }

  private fileToDataURL(file: File, result: VideoResult): Promise<VideoResult> {
    return new Promise((resolve) => {
      let reader = new FileReader();
      reader.onload = function (e) {
        result.dataURL = reader.result;
        resolve(result);
      };
      reader.readAsDataURL(file);
    });
  }
}