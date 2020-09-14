import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
	selector: '[autoBlur]',
	host: {
		'(focus)': 'blur()'
	}
})
export class AutoBlurDirective {

	@Input('time') private _time?: number;

	get time() {
		return this._time || 500;
	}

	constructor(private _host: ElementRef<HTMLElement>) {
	}

	public blur() {
		setTimeout(() => {
			this._host.nativeElement.blur();
		}, this.time);
	}

}
