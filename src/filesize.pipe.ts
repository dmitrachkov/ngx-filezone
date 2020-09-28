import { Pipe, PipeTransform } from '@angular/core';
import { convertFileSizeToString } from './utils';

@Pipe({
	name: 'filesize',
})
export class FileSizePipe implements PipeTransform {

	public transform(value: number): string {
		return convertFileSizeToString(value);
	}
}
