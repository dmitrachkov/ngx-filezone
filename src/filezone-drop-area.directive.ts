import { Directive, Input } from '@angular/core';
import { Filezone } from './filezone.directive';

@Directive({
	selector: '[fzDropArea]',
	host: {
		'[class.fz-drop-area]': 'true'
	}
})
export class FilezoneDropArea {

	constructor() {

	}
}
