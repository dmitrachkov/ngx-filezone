import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileSizePipe } from './filesize.pipe';
import { SafePipe } from './safe.pipe';
import { NgReorderModule } from 'ng-reorder';
import { Filezone } from './filezone.directive';
import { FilezoneButton } from './filezone-button.directive';
import { FilezoneDropArea } from './filezone-drop-area.directive';

@NgModule({
	declarations: [
		FileSizePipe,
		SafePipe,
		Filezone,
		FilezoneButton,
		FilezoneDropArea
	],
	imports: [
		CommonModule,
		NgReorderModule
	],
	exports: [
		Filezone,
		FileSizePipe,
		SafePipe,
		FilezoneButton,
		FilezoneDropArea
	],
	providers: []
})
export class NgxFilezoneModule {}
