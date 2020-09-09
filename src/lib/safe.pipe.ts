import { Pipe, PipeTransform, Sanitizer, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
	name: 'safe'
})
export class SafePipe implements PipeTransform {

	constructor(private _sanitizer: DomSanitizer) { }

	transform(value: string): unknown {
		if (!value) return '';
		else return this._sanitizer.bypassSecurityTrustUrl(value);
	}

}
