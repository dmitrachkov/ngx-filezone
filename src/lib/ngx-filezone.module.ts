import { NgModule } from '@angular/core';
import { NgxFilezoneComponent } from './main/ngx-filezone.component';
import { CommonModule } from '@angular/common';
import { CardComponent } from './card/card.component';
import { FilesizePipe } from './filesize.pipe';
import { SafePipe } from './safe.pipe';
import { SvgPreviewComponent } from './svg-preview/svg-preview/svg-preview.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgReorderModule } from 'ng-reorder';
import { MenuComponent } from './menu/menu.component';

@NgModule({
	declarations: [NgxFilezoneComponent, CardComponent, FilesizePipe, SafePipe, SvgPreviewComponent, MenuComponent],
	imports: [
		CommonModule,
		BrowserAnimationsModule,
		NgReorderModule
	],
	exports: [NgxFilezoneComponent],
	providers: []
})
export class NgxFilezoneModule {}
