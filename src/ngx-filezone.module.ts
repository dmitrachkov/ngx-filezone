import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileSizePipe } from './filesize.pipe';
import { SafePipe } from './safe.pipe';
import { SvgPreviewComponent } from './components/svg-preview/svg-preview.component';
import { NgReorderModule } from 'ng-reorder';
import { CardComponent } from './components/card/card.component';
import { NgxFilezoneComponent } from './components/main/ngx-filezone.component';
import { MenuComponent } from './components/menu/menu.component';
import { AutoBlurDirective } from './auto-blur.directive';

@NgModule({
	declarations: [
		NgxFilezoneComponent,
		CardComponent,
		FileSizePipe,
		SafePipe,
		SvgPreviewComponent,
		MenuComponent,
		AutoBlurDirective
	],
	imports: [
		CommonModule,
		NgReorderModule
	],
	exports: [
		NgxFilezoneComponent,
		FileSizePipe,
		SafePipe,
		AutoBlurDirective
	],
	providers: []
})
export class NgxFilezoneModule {}
