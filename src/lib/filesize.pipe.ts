import { Pipe, PipeTransform } from '@angular/core';
import { convertFileSize } from './utils';

@Pipe({
	name: 'filesize',
})
export class FilesizePipe implements PipeTransform {

	transform(value: number): string {
		return convertFileSize(value);
	}
}
