import { Directive, Input } from '@angular/core';

@Directive({
	selector: '[fzButton]',
	host: {
		'[class.fz-button]': 'true'
	}
})
export class FilezoneButton {

	constructor() {

	}
}
