import { Injectable } from '@angular/core';
import { IFileError } from './interfaces';
import { Subject, Observable } from 'rxjs';
import { convertFileSizeToBytes } from './utils';
import { FileErrorCode } from './enumerations';
import { reorderItems } from './utils';

@Injectable()
export class FileService {

	private _filesNotifier = new Subject<Array<File>>();

	private _errorNotifier = new Subject<Array<IFileError>>();

	private _limitOfFiles = 0;

	private _fileSizeLimit = 0;

	/** Container for files */
	private _files = new Array<File>();

	/** Array for files fomat/type restrictions */
	private _allowedFileTypes = new Array<string>();

	public readonly filesNotifier: Observable<Array<File>>;

	public readonly errorNotifier: Observable<Array<IFileError>>;

	constructor() {
		this.filesNotifier = this._filesNotifier.asObservable();
		this.errorNotifier = this._errorNotifier.asObservable();
	}

	/** Deletes all files */
	public deleteAll(): void {
		this._files.length = 0;
		this._emitFiles();
	}

	/** Deletes a specified file */
	public delete(index: number): void {
		this._files.splice(index, 1);
		this._emitFiles();
	}

	/** @returns Comma-separated list of allowed file extensions or MIME types or an empty string when not defined */
	public getAllowedFileTypes(): string {
		return this._allowedFileTypes.join(',');
	}

	/** @returns Current limit of total amount of files or 0 if not defined */
	public getLimitOfFiles(): number {
		return this._limitOfFiles;
	}

	/** @returns Current limit of size per file or 0 if not defined */
	public getFileSizeLimit(): number {
		return this._fileSizeLimit;
	}

	/** Gets files */
	public receiveFiles(files: Array<File>): void {
		const validFiles = this._fileFilter(files, true);
		if (validFiles.length) {
			this._files.push(...validFiles);
			this._emitFiles();
		}
	}

	/** Method will replace a specified file for the new one */
	public replaceFile(index: number, newFile: File): void {
		const validFile = this._fileFilter([newFile], false);
		if (validFile.length) {
			this._files[index] = newFile;
			this._emitFiles();
		}
	}

	public setLimitOfFiles(value: number): void {
		this._limitOfFiles = value;
	}

	public setFileSizeLimit(value: string): void {
		const result = convertFileSizeToBytes(value);
		this._fileSizeLimit = result;
	}

	/** Parsing string for "input.accept" appropriate values */
	public setAllowedFileTypes(value: string): void {
		const result = new Array<string>();
		if (!!value) {

			// replace "space" symbols and repeated commas
			let list = value.toLowerCase().replace(/\s+/gi, ',').replace(/\,+/, ',');

			// looking for "type/*" like matching
			const all = list.match(/\b(audio|image|video|application|text|multipart|message)\/\*/g);

			// looking for "type/subtype" like matching
			const mediaType = list.match(/\b(audio|image|video|application|text|multipart|message)\/(\.|\-|[a-z]|[0-9])+/g);

			// removing "type/*", "type/subtype" and "type/subtype.subtype" matching
			list = list.replace(/(\w|\d)*\/(\*|\.|\-|[a-z]|[0-9])*/g, '');

			// looking for ".extention" like matching
			const fileExtension = list.match(/\.([a-z]|[0-9])+/g);

			[all, mediaType, fileExtension].forEach((x) => {
				if (x !== null) result.push(...x);
			});
			// result = [...all, ...mediaType, ...fileExtension];
		}

		this._allowedFileTypes = [...result];
	}

	/** Move file FROM the given old position in the filezone TO the new position */
	public sort(from: number, to: number) {
		this._files = reorderItems(this._files, from, to);
		this._emitFiles();
	}

	/** Swap two files at the given indexes in the filezone */
	public swap(first: number, second: number) {
		[this._files[first], this._files[second]] = [this._files[second], this._files[first]];
		this._emitFiles();
	}

	private _emitFiles() {
		this._filesNotifier.next([...this._files]);
	}

	private _emitErrors(errors: Array<IFileError>) {
		this._errorNotifier.next(errors);
	}

	private _fileFilter(files: Array<File>, reduce: boolean): Array<File> {

		const errors = new Array<IFileError>();
		const result = new Array<File>();

		// First step. Filtering files out by size if that restriction exists
		if (!this._fileSizeLimit) result.push(...files);
		else {
			files.forEach(file => {
				file.size <= this._fileSizeLimit ?
					result.push(file) : errors.push({ error: FileErrorCode.SIZE, file } as IFileError);
			});
		}

		// Second step. Filtering files out by type or extension if these restrictions exist
		if (this._allowedFileTypes.length) {
			const validfiles = new Array<File>();

			result.forEach(file => {
				const fileExt = file.name.toLowerCase().match(/\.([a-z]|[0-9])+$/i)[0];
				if (this._allowedFileTypes.includes(fileExt) ||
					this._allowedFileTypes.includes(file.type) ||
					this._allowedFileTypes.includes(`${file.type.split('/')[0]}/*`)) validfiles.push(file);
				else errors.push({ error: FileErrorCode.TYPE, file } as IFileError);
			});
			result.length = 0;
			result.push(...validfiles);
		}

		// Third step. Remove files that already exist
		if (this._files.length > 0) {

			for (const file of result) {
				if (!!this._files.find((x) => x.name === file.name && x.size === file.size)) {
					errors.push({ error: FileErrorCode.COPY, file } as IFileError);
					result.splice(result.indexOf(file), 1);
				}
			}
		}

		// Final step. Reduce files amount if needed
		if (reduce) {
			if (!!this._limitOfFiles && files.length + this._files.length > this._limitOfFiles) {
				const length = this._limitOfFiles - this._files.length;
				result.splice(length, result.length).forEach((file: File) => {
					errors.push({ error: FileErrorCode.NUMBER, file } as IFileError);
				});
				result.length = length;
			}
		}
		if (errors.length) this._emitErrors([...errors]);
		return result;
	}
}
