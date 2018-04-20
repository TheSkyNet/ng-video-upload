import { Component, ViewChild, ElementRef, Renderer, Input, Output, EventEmitter, ChangeDetectorRef, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { createVideo, resizeVideo } from './utils';
import { FileUploader } from './file-uploader';
import 'rxjs/add/operator/filter';
import * as Cropper from 'cropperjs';
import { cssTemplate, htmlTemplate } from './template';
export var Status;
(function (Status) {
    Status[Status["NotSelected"] = 0] = "NotSelected";
    Status[Status["Selected"] = 1] = "Selected";
    Status[Status["Uploading"] = 2] = "Uploading";
    Status[Status["Loading"] = 3] = "Loading";
    Status[Status["Loaded"] = 4] = "Loaded";
    Status[Status["Error"] = 5] = "Error";
})(Status || (Status = {}));
var VideoUploaderModuleVideoUploaderComponent = (function () {
    function VideoUploaderModuleVideoUploaderComponent(renderer, uploader, changeDetector) {
        this.renderer = renderer;
        this.uploader = uploader;
        this.changeDetector = changeDetector;
        this.statusEnum = Status;
        this._status = Status.NotSelected;
        this.thumbnailWidth = 150;
        this.thumbnailHeight = 150;
        this.propagateChange = function (_) { };
        this.cropper = undefined;
        this.onUpload = new EventEmitter();
        this.onStatusChange = new EventEmitter();
    }
    Object.defineProperty(VideoUploaderModuleVideoUploaderComponent.prototype, "videoThumbnail", {
        get: function () {
            return this._videoThumbnail;
        },
        set: function (value) {
            this._videoThumbnail = value;
            this.propagateChange(this._videoThumbnail);
            if (value !== undefined) {
                this.status = Status.Selected;
            }
            else {
                this.status = Status.NotSelected;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VideoUploaderModuleVideoUploaderComponent.prototype, "errorMessage", {
        get: function () {
            return this._errorMessage;
        },
        set: function (value) {
            this._errorMessage = value;
            if (value) {
                this.status = Status.Error;
            }
            else {
                this.status = Status.NotSelected;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VideoUploaderModuleVideoUploaderComponent.prototype, "status", {
        get: function () {
            return this._status;
        },
        set: function (value) {
            this._status = value;
            this.onStatusChange.emit(value);
        },
        enumerable: true,
        configurable: true
    });
    VideoUploaderModuleVideoUploaderComponent.prototype.writeValue = function (value) {
        if (value) {
            this.loadAndResize(value);
        }
        else {
            this._videoThumbnail = undefined;
            this.status = Status.NotSelected;
        }
    };
    VideoUploaderModuleVideoUploaderComponent.prototype.registerOnChange = function (fn) {
        this.propagateChange = fn;
    };
    VideoUploaderModuleVideoUploaderComponent.prototype.registerOnTouched = function () { };
    VideoUploaderModuleVideoUploaderComponent.prototype.ngOnInit = function () {
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
    };
    VideoUploaderModuleVideoUploaderComponent.prototype.ngAfterViewChecked = function () {
        if (this.options && this.options.cropEnabled && this.videoElement && this.fileToUpload && !this.cropper) {
            this.cropper = new Cropper(this.videoElement.nativeElement, {
                viewMode: 1,
                aspectRatio: this.options.cropAspectRatio ? this.options.cropAspectRatio : null
            });
        }
    };
    VideoUploaderModuleVideoUploaderComponent.prototype.ngOnDestroy = function () {
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
    };
    VideoUploaderModuleVideoUploaderComponent.prototype.loadAndResize = function (url) {
        var _this = this;
        this.status = Status.Loading;
        this.uploader.getFile(url, this.options).subscribe(function (file) {
            if (_this.options.resizeOnLoad) {
                // thumbnail
                var result = {
                    file: file,
                    url: URL.createObjectURL(file)
                };
                _this.resize(result).then(function (r) {
                    _this._videoThumbnail = r.resized.dataURL;
                    _this.status = Status.Loaded;
                });
            }
            else {
                var result = {
                    file: null,
                    url: null
                };
                _this.fileToDataURL(file, result).then(function (r) {
                    _this._videoThumbnail = r.dataURL;
                    _this.status = Status.Loaded;
                });
            }
        }, function (error) {
            _this.errorMessage = error || 'Error while getting an video';
        });
    };
    VideoUploaderModuleVideoUploaderComponent.prototype.onVideoClicked = function () {
        this.renderer.invokeElementMethod(this.fileInputElement.nativeElement, 'click');
    };
    VideoUploaderModuleVideoUploaderComponent.prototype.onFileChanged = function () {
        var file = this.fileInputElement.nativeElement.files[0];
        if (!file)
            return;
        this.validateAndUpload(file);
    };
    VideoUploaderModuleVideoUploaderComponent.prototype.validateAndUpload = function (file) {
        var _this = this;
        this.propagateChange(null);
        if (this.options && this.options.allowedVideoTypes) {
            if (!this.options.allowedVideoTypes.some(function (allowedType) { return file.type === allowedType; })) {
                this.errorMessage = 'Only these video types are allowed: ' + this.options.allowedVideoTypes.join(', ');
                return;
            }
        }
        if (this.options && this.options.maxVideoSize) {
            if (file.size > this.options.maxVideoSize * 1024 * 1024) {
                this.errorMessage = "Video must not be larger than " + this.options.maxVideoSize + " MB";
                return;
            }
        }
        this.fileToUpload = file;
        if (this.options && this.options.autoUpload) {
            this.upload();
        }
        // thumbnail
        var result = {
            file: file,
            url: URL.createObjectURL(file)
        };
        this.resize(result).then(function (r) {
            _this._videoThumbnail = r.resized.dataURL;
            _this.origVideoWidth = r.width;
            _this.orgiVideoHeight = r.height;
            if (_this.options && !_this.options.autoUpload) {
                _this.status = Status.Selected;
            }
        });
    };
    VideoUploaderModuleVideoUploaderComponent.prototype.upload = function () {
        var _this = this;
        this.progress = 0;
        this.status = Status.Uploading;
        var cropOptions = undefined;
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
        var id = this.uploader.uploadFile(this.fileToUpload, this.options, cropOptions);
        // file progress
        var sub = this.uploader.fileProgress$.filter(function (file) { return file.id === id; }).subscribe(function (file) {
            _this.progress = file.progress;
            if (file.error) {
                if (file.status || file.statusText) {
                    _this.errorMessage = file.status + ": " + file.statusText;
                }
                else {
                    _this.errorMessage = 'Error while uploading';
                }
                // on some upload errors change detection does not work, so we are forcing manually
                // on some upload errors change detection does not work, so we are forcing manually
                _this.changeDetector.detectChanges();
            }
            if (file.done) {
                // notify that value was changed only when video was uploaded and no error
                if (!file.error) {
                    _this.propagateChange(_this._videoThumbnail);
                    _this.status = Status.Selected;
                    _this.fileToUpload = undefined;
                }
                _this.onUpload.emit(file);
                sub.unsubscribe();
            }
        });
    };
    VideoUploaderModuleVideoUploaderComponent.prototype.removeVideo = function () {
        this.fileInputElement.nativeElement.value = null;
        this.videoThumbnail = undefined;
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
    };
    VideoUploaderModuleVideoUploaderComponent.prototype.dismissError = function () {
        this.errorMessage = undefined;
        this.removeVideo();
    };
    VideoUploaderModuleVideoUploaderComponent.prototype.drop = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!e.dataTransfer || !e.dataTransfer.files.length) {
            return;
        }
        this.validateAndUpload(e.dataTransfer.files[0]);
        this.updateDragOverlayStyles(false);
    };
    VideoUploaderModuleVideoUploaderComponent.prototype.dragenter = function (e) {
        e.preventDefault();
        e.stopPropagation();
    };
    VideoUploaderModuleVideoUploaderComponent.prototype.dragover = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.updateDragOverlayStyles(true);
    };
    VideoUploaderModuleVideoUploaderComponent.prototype.dragleave = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.updateDragOverlayStyles(false);
    };
    VideoUploaderModuleVideoUploaderComponent.prototype.updateDragOverlayStyles = function (isDragOver) {
        // TODO: find a way that does not trigger dragleave when displaying overlay
        // if (isDragOver) {
        //  this.renderer.setElementStyle(this.dragOverlayElement.nativeElement, 'display', 'block');
        // } else {
        //  this.renderer.setElementStyle(this.dragOverlayElement.nativeElement, 'display', 'none');
        // }
    };
    VideoUploaderModuleVideoUploaderComponent.prototype.resize = function (result) {
        var _this = this;
        var resizeOptions = {
            resizeHeight: this.thumbnailHeight,
            resizeWidth: this.thumbnailWidth,
            resizeType: result.file.type,
            resizeMode: this.options.thumbnailResizeMode
        };
        return new Promise(function (resolve) {
            createVideo(result.url, function (video) {
                var dataUrl = resizeVideo(video, resizeOptions);
                result.width = video.width;
                result.height = video.height;
                result.resized = {
                    dataURL: dataUrl,
                    type: _this.getType(dataUrl)
                };
                resolve(result);
            });
        });
    };
    VideoUploaderModuleVideoUploaderComponent.prototype.getType = function (dataUrl) {
        return dataUrl.match(/:(.+\/.+;)/)[1];
    };
    VideoUploaderModuleVideoUploaderComponent.prototype.fileToDataURL = function (file, result) {
        return new Promise(function (resolve) {
            var reader = new FileReader();
            reader.onload = function (e) {
                result.dataURL = reader.result;
                resolve(result);
            };
            reader.readAsDataURL(file);
        });
    };
    VideoUploaderModuleVideoUploaderComponent.decorators = [
        { type: Component, args: [{
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
                            useExisting: forwardRef(function () { return VideoUploaderModuleVideoUploaderComponent; }),
                            multi: true
                        }
                    ]
                },] },
    ];
    /** @nocollapse */
    VideoUploaderModuleVideoUploaderComponent.ctorParameters = function () { return [
        { type: Renderer, },
        { type: FileUploader, },
        { type: ChangeDetectorRef, },
    ]; };
    VideoUploaderModuleVideoUploaderComponent.propDecorators = {
        "videoElement": [{ type: ViewChild, args: ['videoElement',] },],
        "fileInputElement": [{ type: ViewChild, args: ['fileInput',] },],
        "dragOverlayElement": [{ type: ViewChild, args: ['dragOverlay',] },],
        "options": [{ type: Input },],
        "onUpload": [{ type: Output },],
        "onStatusChange": [{ type: Output },],
    };
    return VideoUploaderModuleVideoUploaderComponent;
}());
export { VideoUploaderModuleVideoUploaderComponent };
