import { Injectable } from '@angular/core';
import { IDrawImageParameters, IFileProperties, IFileError } from './interfaces';
import { Subject, Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { NgxFilezoneComponent } from './components/main/ngx-filezone.component';
import { parseFileSizeInBytes, secondsToTimeString } from './utils';
import { FileErrorCode } from './enumerations';
import { reorderItems } from 'ng-reorder';

@Injectable()
export class FileService {

	private _clientSubscription: Subscription;

	private _filesNotifier: Subject<Array<File>>;

	private _errorNotifier: Subject<Array<IFileError>>;

	private _maxFileNumber!: number;

	private _maxFileSize!: number;

	/** Container for files */
	private _files!: Array<File>;

	/** Array for files fomat/type restrictions */
	private _accept!: Array<string>;

	public readonly filesNotifier: Observable<Array<File>>;

	public readonly errorNotifier: Observable<Array<IFileError>>;

	constructor() {
		this._accept = [];
		this._files = new Array<File>();
		this._maxFileSize = this._maxFileNumber = 0;
		this._filesNotifier = new Subject<Array<File>>();
		this._errorNotifier = new Subject<Array<IFileError>>();
		this.filesNotifier = this._filesNotifier.asObservable();
		this.errorNotifier = this._errorNotifier.asObservable();
	}

	public initClient(client: NgxFilezoneComponent): void {
		this._clientSubscription = client.destroy.pipe(take(1)).subscribe({
			next: () => this._complete()
		});
	}

	/** Deletes all files */
	public deleteAll() {
		this._files.length = 0;
		this._emitFiles();
	}

	/** Deletes a specified file */
	public delete(file: File) {
		const index = this._files.indexOf(file);
		this._files.splice(index, 1);
		this._emitFiles();
	}

	public getAcceptableTypes(): string {
		return this._accept.join(', ');
	}

	public getFileProperties(file: File): Promise<IFileProperties> {
		return new Promise<IFileProperties>((resolve, reject) => {
			const properties: IFileProperties = {
				name: file.name,
				size: file.size,
				extention: file.name.match(/\.[a-z0-9]+/i)[0] ?? '',
				type: this._typeOfFile(file.type)
			};

			const type = properties.type;

			if (type === 'audio' || type === 'image' || type === 'video') {
				const url = URL.createObjectURL(file);
				let reader: Promise<IFileProperties>;
				if (type === 'audio') reader = this._getAudioDuration(url);
				if (type === 'image') reader = this._getImagePreview(url, 250);
				if (type === 'video') reader = this._getVideoPreview(url, 250);

				reader
					.then(x => { Object.keys(x).forEach(property => properties[property] = x[property]); })
					.catch()
					.finally(() => { URL.revokeObjectURL(url); resolve(properties); });

			} else resolve(properties);
		});
	}

	public receiveFiles(inputFiles: FileList): void {
		const validFiles = this._fileFilter(Array.from(inputFiles));

		if (validFiles.length) {
			this._files.push(...validFiles);
			this._emitFiles();
		}
	}

	public replaceFile(oldFile: File, newFile: File): void {
		const validFile = this._fileFilter([newFile]);
		if (validFile.length) {
			const index = this._files.indexOf(oldFile);
			this._files[index] = newFile;
			this._emitFiles();
		}
	}

	public setMaxFileNumber(value: number): number {
		if (value !== this._maxFileNumber) {
			this._maxFileNumber = value;
			this._files = this._fileCountFilter(this._files);
			this._filesNotifier.next([...this._files]);
		}
		return value;
	}

	public setMaxFileFize(value: string): number {
		const result = parseFileSizeInBytes(value);

		if (result && result !== this._maxFileSize) {
			this._maxFileSize = result;
			this._files = this._fileSizeFilter(this._files);
			this._filesNotifier.next([...this._files]);
		}
		return result;
	}

	/** Parsing string for "input.accept" appropriate values */
	public setAcceptableTypes(value: string): Array<string> {
		let result: Array<string>;
		if (!value) {
			result = [];
		} else {

			const allExp = /\b(audio|image|video|application|text|multipart|message)\/\*/g;
			const mediaTypeExp = /\b(audio|image|video|application|text|multipart|message)\/(\.|\-|[a-z]|[0-9])+/g;
			const fileExtensionExp = /\.([a-z]|[0-9])+/g;

			let list = value.toLowerCase().replace(/\s+/gi, ',').replace(/\,+/, ',');
			const all = list.match(allExp);
			const mediaType = list.match(mediaTypeExp);
			list = list.replace(/(\w|\d)*\/(\*|\.|\-|[a-z]|[0-9])*/g, '');
			const fileExtension = list.match(fileExtensionExp);

			result = [...all, ...mediaType, ...fileExtension];
		}

		if (result !== this._accept) {
			this._accept = [...result];
			this._files = this._formatFilter(this._files);
			this._filesNotifier.next([...this._files]);
		}
		return result;
	}

	public sort(previous: number, current: number) {
		this._files = reorderItems(this._files, previous, current);
		this._emitFiles();
	}

	private _complete() {
		this._filesNotifier.complete();
	}

	private _emitFiles() {
		this._filesNotifier.next([...this._files]);
	}

	private _emitErrors(errors: Array<IFileError>) {
		this._errorNotifier.next(errors);
	}

	/**
	 * Method which gets audio duration
	 * @param file A video file you want to get a thumbnail from
	 * @returns Promise<FileProperties> with fulfilled duration field
	 */
	private _getAudioDuration(fileURL: string): Promise<IFileProperties> {
		return new Promise((resolve, reject) => {
			const properties: IFileProperties = {};
			const audio = new Audio();

			audio.onloadedmetadata = () => {
				properties.duration = secondsToTimeString(audio.duration);
				resolve(properties);
			};
			audio.onerror = () => {
				reject('Can\'t read the audio');
			};
			audio.src = fileURL;
		});
	}

	/**
	 * Method serves to calculate new size to fit into canvas
	 * and aligned in the middle
	 * @param width source width
	 * @param height source height
	 * @param widthToFit width of canvas
	 * @param heightToFit height of canvas
	 */
	private _getCanvasParameters(width: number, height: number, widthToFit: number, heightToFit: number): IDrawImageParameters {

		const divider = Math.min(width / widthToFit, height / heightToFit);

		const dw = Math.ceil(width / divider);
		const dh = Math.ceil(height / divider);
		const dx = Math.floor((widthToFit - dw) / 2);
		const dy = Math.floor((heightToFit - dh) / 2);

		return { dx, dy, dw, dh } as IDrawImageParameters;
	}

	/**
	 * Method which drawing image thumbnail
	 * @param file An image file you want to get a thumbnail from
	 * @param width width of a needed thumbnail
	 * @param height heidht of a needed thumbnail (Default equal to width)
	 * @returns Promise<FileProperties> with fulfilled resolution and url fields
	 */
	private _getImagePreview(fileURL: string, width: number, height: number = width): Promise<IFileProperties> {
		return new Promise((resolve, reject) => {
			const result: IFileProperties = {};

			// Creating nescessary HTML elements
			const canvas = document.createElement('canvas');
			const canvasContext = canvas.getContext('2d');
			const image = document.createElement('img');

			image.onload = () => {
				canvas.width = width;
				canvas.height = height;

				// Getting parameters (to scale file) for canvas.drawImage
				const $drw = this._getCanvasParameters(
					image.naturalWidth, image.naturalHeight, width, height);
				canvasContext.drawImage(image, $drw.dx, $drw.dy, $drw.dw, $drw.dh);
				result.url = canvas.toDataURL('image/png', 1);
				result.resolution = `${image.naturalWidth}x${image.naturalHeight}`;
				resolve(result);
			};

			image.onerror = (e) => {
				reject('Can\' read the image');
			};

			image.src = fileURL;
		});
	}

	/**
	 * Method which drawing video thumbnail
	 * @param file A video file you want to get a thumbnail from
	 * @param width width of a needed thumbnail
	 * @param height heidht of a needed thumbnail (Default equal to width)
	 * @returns Promise<FileProperties> with fulfilled resolution, duration and url fields
	 */
	private _getVideoPreview(fileURL: string, width: number, height: number = width): Promise<IFileProperties> {
		return new Promise((resolve, reject) => {
			const result: IFileProperties = {};

			// Creating nescessary HTML elements
			const canvas = document.createElement('canvas');
			const canvasContext = canvas.getContext('2d');
			const videoElement = document.createElement('video');

			// When video metadata is loaded
			videoElement.onloadedmetadata = () => {
				canvas.width = width;
				canvas.height = height;
				result.resolution = `${videoElement.videoWidth}x${videoElement.videoHeight}`;
				result.duration = secondsToTimeString(videoElement.duration);
			};

			// When video data is loaded we need to set the time we want to get image from
			videoElement.onloadeddata = () => {
				videoElement.currentTime = 0;
			};

			// When video file is playable the function will draw a frame of current time position
			videoElement.oncanplay = () => {
				// canplay event will occur even we have metadata loaded only
				// so we need to check ready state
				// If video HAVE_ENOUGH_DATA, which equal 4, canvas will capture image data
				// https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
				if (videoElement.readyState === 4) {
					// Getting parameters (to scale file) for canvas.drawImage
					const $drw = this._getCanvasParameters(
						videoElement.videoWidth, videoElement.videoHeight, width, height);
					canvasContext.drawImage(videoElement, $drw.dx, $drw.dy, $drw.dw, $drw.dh);
					result.url = canvas.toDataURL('image/png', 1);
					resolve(result);
				}
			};

			videoElement.onerror = () => {
				reject('Can\'t read the video');
			};

			videoElement.src = fileURL;
		});

	}

	private _fileFilter(files: Array<File>): Array<File> {

		const errors = new Array<IFileError>();
		const result = new Array<File>();

		// First step. Filtering files out by size if that restriction exists
		if (!this._maxFileSize) result.push(...files);
		else {
			files.forEach(file => {
				file.size <= this._maxFileSize ?
					result.push(file) : errors.push({ error: FileErrorCode.SIZE, file } as IFileError);
			});
		}

		// Second step. Filtering files out by type or extension if these restrictions exist
		if (this._accept.length) {
			const validfiles = new Array<File>();

			result.forEach(file => {
				const fileExt = file.name.toLowerCase().match(/\.([a-z]|[0-9])+$/i)[0];
				if (this._accept.includes(fileExt) ||
					this._accept.includes(file.type) ||
					this._accept.includes(`${file.type.split('/')[0]}/*`)) validfiles.push(file);
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

		// Final step. Reduce files count if needed
		if (!!this._maxFileNumber && files.length + this._files.length > this._maxFileNumber) {
			const length = this._maxFileNumber - this._files.length;
			result.splice(length, result.length).forEach((file: File) => {
				errors.push({ error: FileErrorCode.NUMBER, file } as IFileError);
			});
			result.length = length;
		}
		if (errors.length) this._emitErrors([...errors]);
		return result;
	}

	private _fileCountFilter(files: Array<File>): Array<File> {
		if (!!this._maxFileNumber && files.length > this._maxFileNumber)
			files.length = this._maxFileNumber;
		return files;
	}

	private _fileSizeFilter(files: Array<File>): Array<File> {
		if (!this._maxFileSize) return files;
		const result = new Array<File>();
		files.forEach(file => {
			if (file.size <= this._maxFileSize) result.push(file);
		});
		return result;
	}

	private _formatFilter(files: Array<File>): Array<File> {
		if (!files.length) return files;
		// When we have file type restrictions
		if (this._accept.length > 0) {
			const result = new Array<File>();
			const accept = this._accept;

			[].forEach.call(files, (file: File) => {
				const fileExt = file.name.toLowerCase().match(/\.([a-z]|[0-9])+$/i)[0];
				if (accept.includes(fileExt) ||
					accept.includes(file.type) ||
					accept.includes(`${file.type.split('/')[0]}/*`)) result.push(file);
			});
			return result;
		}
		else return Array.from(files);
	}

	private _typeOfFile(type: string): string {
		return type.slice(0, type.search(/\//));
	}
}
