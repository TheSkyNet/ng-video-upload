/// <reference types="cropperjs" />
import { OnInit, OnDestroy, AfterViewChecked, ElementRef, Renderer, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { VideoUploaderModuleVideoUploaderOptions } from './interfaces';
import { FileUploader } from './file-uploader';
import { UploadedFile } from './uploaded-file';
import 'rxjs/add/operator/filter';
import * as Cropper from 'cropperjs';
export declare enum Status {
    NotSelected = 0,
    Selected = 1,
    Uploading = 2,
    Loading = 3,
    Loaded = 4,
    Error = 5,
}
export declare class VideoUploaderModuleVideoUploaderComponent implements OnInit, OnDestroy, AfterViewChecked, ControlValueAccessor {
    private renderer;
    private uploader;
    private changeDetector;
    statusEnum: typeof Status;
    _status: Status;
    thumbnailWidth: number;
    thumbnailHeight: number;
    _videoThumbnail: any;
    _errorMessage: string;
    progress: number;
    propagateChange: (_: any) => void;
    origVideoWidth: number;
    orgiVideoHeight: number;
    cropper: Cropper;
    fileToUpload: File;
    videoElement: ElementRef;
    fileInputElement: ElementRef;
    dragOverlayElement: ElementRef;
    options: VideoUploaderModuleVideoUploaderOptions;
    onUpload: EventEmitter<UploadedFile>;
    onStatusChange: EventEmitter<Status>;
    constructor(renderer: Renderer, uploader: FileUploader, changeDetector: ChangeDetectorRef);
    videoThumbnail: any;
    errorMessage: string;
    status: Status;
    writeValue(value: any): void;
    registerOnChange(fn: (_: any) => void): void;
    registerOnTouched(): void;
    ngOnInit(): void;
    ngAfterViewChecked(): void;
    ngOnDestroy(): void;
    loadAndResize(url: string): void;
    onVideoClicked(): void;
    onFileChanged(): void;
    validateAndUpload(file: File): void;
    upload(): void;
    removeVideo(): void;
    dismissError(): void;
    drop(e: DragEvent): void;
    dragenter(e: DragEvent): void;
    dragover(e: DragEvent): void;
    dragleave(e: DragEvent): void;
    private updateDragOverlayStyles(isDragOver);
    private resize(result);
    private getType(dataUrl);
    private fileToDataURL(file, result);
}
