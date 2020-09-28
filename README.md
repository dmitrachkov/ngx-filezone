# NgxFilezone

Module provides file input UI with image and video previews

> see [live example](https://stackblitz.com/edit/ngx-filezone?file=src/app/app.component.html)

# API
## Directives
### Filezone
Selector: `[filezone]`  
Exported as: `filezone`  
File input interface.  
Reacts for users clicks within of all the host element bounding rect (if not restricted by FilezoneButton) and drag-n-drop events carrying files (if not restricted by FilezoneDropArea)  

> To prevent additional change detection launch
> all output events of the filezone will be emitted when you subscribe on them only 
> but the 'filechange' event.

#### Inputs
| Input        | Type    | Description                                                                                                       |
| ------------ | ------- | ----------------------------------------------------------------------------------------------------------------- |
| accept       | string  | Comma-separated list of allowed file extensions or MIME types. Same as \<input type="file"/>'s "accept" attribute |
| sizeLimit    | string  | Max size of files you want to allow ( 3.5MB, 250KB, ect.)                                                         |
| limitOfFiles | number  | Maximum number of files you want to allow for user                                                                |

#### Outputs

| Output        | Type                         | Description                                                                   |
| ------------  | ---------------------------- | ----------------------------------------------------------------------------- |
| fileschange   | EventEmitter\<File\[]>       | Emits every time whether number of files or file sequence has changed         |
| errors        | EventEmitter\<IFileError\[]> | Emits if some of files don't fit current restrictions after user's input      |
| docdragbegin  | EventEmitter\<void>          | Emits after a drag event carrying files has detected on the document          |
| docdragfinish | EventEmitter\<void>          | Emits when user drops files or the draging event is leaving the document      |
| dragbegin     | EventEmitter\<void>          | Same as 'docdragbegin' event but at the host element or restricted drop area  |
| dragfinish    | EventEmitter\<void>          | Same as 'docdragfinish' event but at the host element or restricted drop area |

#### Properties

| Name                   | Type    | Description                                                                                       |
| ---------------------- |---------| ------------------------------------------------------------------------------------------------- |
| accept                 | string  | Comma-separated list of allowed file extensions or MIME types or an empty string when not defined |
| sizeLimitInBytes       | number  | Current limit of size per file or 0 if not defined                                                |
| limitOfFiles           | number  | Current limit of total amount of files or 0 if not defined                                        |
| files                  | File\[] | Array of files that currently inside the filezone                                                 |
| windowHasDraggingEvent | boolean | True when user is dragging files over the document                                                |
| hostHasDraggingEvent   | boolean | True when user is dragging files over the host element or restricted drop area                    |

#### Methods

| Name                                         | Description                                                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| deleteAllFiles()                             | Deletes all files from the filezone                                                                    |
| deleteFile(index: number)                    | Deletes a specified file with given index in filezone                                                  |
| recieveFiles(files: FileList \| File\[])     | Gets files to the filezone                                                                             |
| replaceFile(index: number)                   | Method will open the file dialog window (has to be fired by users action) and replace a specified file |
| replaceFileFor(index: number, newFile: File) | Method replaces specified file for the new one                                                         |
| sort(from: number, to: number)               | Move file FROM the given old position in the filezone TO the new position                              |
| swap(first: number, second: number)          | Swap two files at the given indexes in the filezone                                                    |

### FilezoneDropArea
Selector: `[fzDropArea]`  
Constrains area of the filezone which reacts for drag-n-drop events. Must be within the filezone element

### FilezoneButton
Selector: `[fzButton]`  
Constrains area of the filezone which reacts for click events. Must be within the filezone element

## Pipes

### FileSizePipe
Name: `filesize`  
Transforms numeric value representing size of file in bytes to readable string (3 MB, 2.56 KB, ect.)

### SafePipe
Name: `safeurl`  
Transforms url string to SafeUrl value

## Interfaces

### IFileProperties
Interface
| Data       | Type       | Description                                            |
| ---------- | ---------- | ------------------------------------------------------ |
| duration   | string     | Duration of the file (video or audio type only)        |
| extention  | string     | Extention of the file                                  |
| name       | string     | Name of the file                                       |
| resolution | string     | Resolution of the file (video or image type only)      |
| size       | number     | Size of the file in bytes                              |
| type       | string     | Media type of the file                                 |
| url        | string     | Represents the file preview (video or image type only) |


### IFileError
Interface

| Data         | Type       | Description                       |
| ------------ | ---------- | --------------------------------- |
| error        | number     | Error code                        |
| file         | File       | File that cause the error         |

### FileErrorCode

Enumeration

| Value        | Description                                 |
| ------------ | ------------------------------------------- |
| SIZE = 0     | File size is more than allowed              |
| TYPE = 1     | Not allowed type of file                    |
| COPY = 2     | The list of files already includes the file |
| NUMBER = 3   | Beyond of max number of files               |

## Services

### PreviewService
Singletone. Has one method *getFileProperties* which returns file media data with preview 
(if availiable and file format supported by modern browsers).
> Service has global queue and works with each file you wish to get parameters from 
> sequentially throughout the app
 
`getFileProperties(file: File, width?: number, height?: number) => Promise<IFileProperties>`
| Parameter      | Description                                                               |
| -------------- | ------------------------------------------------------------------------- |
| file: File     | File you want to get properties from                                      |
| width: number  | Width (in pixels) of the preview you want to get. Default 250             |
| height: number | Height (in pixels) of the preview you want to get. Default equal to width |

## Utilities

`convertFileSizeToString(value: number) => string`   
Transforms value in bytes to readable string  

`convertFileSizeToBytes(value: string) => number`  
Converting string representing size of file (4 MB, 5.35 KB, etc) to numeric value  

`secondsToTimeString(time: number) => string`  
Transforms numeric value in seconds to HH:MM:SS string or MM:SS if hours is equal to 0  

> The convertFileSizeToString and convertFileSizeToBytes functions 
> use base 2 (binary) system where 1KB equal to 1024 bytes

# Usage

> see [live example](https://stackblitz.com/edit/ngx-filezone?file=src/app/app.component.html)

1. Register the module within module you wish
```typescript
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxFilezoneModule } from 'ngx-filezone';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgxFilezoneModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
2. Create your markup
```html
<div #fz="filezone" filezone 
[accept]="'image/*, .mp4'" [sizeLimit]="'9mb'" [limitOfFiles]="10"
[class.highlighted]="fz.windowHasDraggingEvent">
    <button fzButton>Upload files</button>
    <span>or drop them here</span>
    <section fzDropArea>
        <span>DROP YOUR FILES HERE</span>
    </section>
</div>
```
3. Style it
```css
.fz-button {
  border: none;
  background: none;
  padding: 0.5em;
  cursor: pointer;
  font-family: "Segoe UI", sans-serif;
  position: relative;
  color: white;
  border: #858585;
  border-width: 1px;
  border-style: solid;
  background: #707070;
}
.fz-button:focus {
  outline: none;
}
.fz-button:hover {
  background: #111111;
}

.filezone {
  font-family: "Segoe UI", sans-serif;
  color: gray;
  position: relative;
  min-height: 10em;
  min-width: 90vw;
  border: #5c5c5c;
  border-radius: 0.5em;
  border-style: dashed;
  border-width: 3px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.filezone.highlighted .fz-drop-area {
  display: flex;
}

.fz-drop-area {
  display: none;
  position: absolute;
  border-radius: 0.3em;
  top: 2px;
  bottom: 2px;
  left: 2px;
  right: 2px;
  background: #426c59;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
```