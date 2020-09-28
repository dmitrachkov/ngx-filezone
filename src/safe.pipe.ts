import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
	name: 'safeurl'
})
export class SafePipe implements PipeTransform {

	constructor(private _sanitizer: DomSanitizer) { }

	public transform(value: string): SafeUrl {
		if (!value) return '';
		else return this._sanitizer.bypassSecurityTrustUrl(value);
	}

}
