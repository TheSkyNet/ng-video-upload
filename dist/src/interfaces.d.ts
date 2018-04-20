export interface FileUploaderOptions {
    uploadUrl: string;
    httpMethod?: string;
    withCredentials?: boolean;
    customHeaders?: any;
    fieldName?: string;
    authToken?: string;
    authTokenPrefix?: string;
}
export interface VideoUploaderModuleVideoUploaderOptions extends FileUploaderOptions {
    thumbnailHeight?: number;
    thumbnailWidth?: number;
    thumbnailResizeMode?: string;
    allowedVideoTypes?: string[];
    maxVideoSize?: number;
    resizeOnLoad?: boolean;
    autoUpload?: boolean;
    cropEnabled?: boolean;
    cropAspectRatio?: number;
}
export interface VideoResult {
    file: File;
    url: string;
    dataURL?: string;
    width?: number;
    height?: number;
    resized?: {
        dataURL: string;
        type: string;
    };
}
export interface ResizeOptions {
    resizeHeight?: number;
    resizeWidth?: number;
    resizeQuality?: number;
    resizeType?: string;
    resizeMode?: string;
}
export interface CropOptions {
    x: number;
    y: number;
    width: number;
    height: number;
}
