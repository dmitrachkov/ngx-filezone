# NgxFilezone

Module provides file input UI with image and video previews and drag-n-drop sorting functionality

> see [live example](https://stackblitz.com/edit/ngx-filezone?file=src/app/app.component.html)

## Usage

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
2. Insert following string into your HTML code
```html
<ngx-filezone></ngx-filezone>
```
3. Enjoy

### Inputs

| Input          | Type    | Description                                                                                                       |
| -------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| accept         | string  | Comma-separated list of allowed file extensions or MIME types. Same as \<input type="file"/>'s "accept" attribute |
| maxFileSize    | string  | Max size of files you want to allow ( 3.5MB, 250KB, ect.)                                                         |
| maxFileNumber  | number  | Maximum number of files you want to allow for user                                                                |

### Outputs

| Output       | Type                             | Description                                                                   |
| ------------ | -------------------------------- | ----------------------------------------------------------------------------- |
| filesChange  | EventEmitter\<Array\<File>>      | Emits every time whether number of files or file sequence has changed         |
| errors       | EventEmitter\<Array\<FileError>> | Emits once after user's input if some of files don't fit restrictions         |

## API

### FileError

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