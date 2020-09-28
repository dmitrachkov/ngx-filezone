/*
 * Public API Surface of ngx-filezone
 */

export * from './ngx-filezone.module';
export { FileErrorCode } from './enumerations';
export { IFileError, IFileProperties } from './interfaces';
export { PreviewService } from './preview.service';
export { Filezone } from './filezone.directive';
export { FilezoneButton } from './filezone-button.directive';
export { FilezoneDropArea } from './filezone-drop-area.directive';
export { convertFileSizeToString, secondsToTimeString, convertFileSizeToBytes } from './utils';
