import { Injectable } from '@angular/core';
import { IDrawImageParameters, IFileProperties } from './interfaces';
import { secondsToTimeString } from './utils';
import { Queue } from './queue';

@Injectable({
	providedIn: 'root'
})
export class PreviewService {

	private _queue = new Queue<string>();

	constructor() { }

	public getFileProperties(file: File, width = 250, height?: number): Promise<IFileProperties> {
		return new Promise<IFileProperties>((resolve) => {
			const properties: IFileProperties = {
				name: file.name,
				size: file.size,
				extention: file.name.match(/\.[a-z0-9]+/i)[0] ?? '',
				type: this.typeOfFile(file)
			};

			const awaiter = this._queue.move.subscribe({
				next: (data) => {

					if (data === file.name) {

						awaiter.unsubscribe();

						const type = properties.type;

						if (type === 'audio' || type === 'image' || type === 'video') {
							const url = URL.createObjectURL(file);
							let reader: Promise<IFileProperties>;
							if (type === 'audio') reader = this.getAudioDuration(url);
							if (type === 'image') reader = this.getImagePreview(url, width, height);
							if (type === 'video') reader = this.getVideoPreview(url, width, height);

							reader.then(x => {
								Object.keys(x).forEach(property => properties[property] = x[property]);
							}).finally(() => {
								resolve(properties);
								this._queue.done(file.name);
								URL.revokeObjectURL(url);
							});

						} else {
							this._queue.done(file.name);
							resolve(properties);
						}
					}
				}
			});
			this._queue.add(file.name);
		});
	}

	/**
	 * Method which gets audio duration
	 * @param fileURL A url of a video file you want to get a thumbnail from
	 * @returns Promise<FileProperties> with fulfilled duration field
	 */
	private async getAudioDuration(fileURL: string): Promise<IFileProperties> {
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
	 * Method which drawing image thumbnail
	 * @param fileURL A url of an image file you want to get a thumbnail from
	 * @param width width of a needed thumbnail
	 * @param height heidht of a needed thumbnail (Default equal to width)
	 * @returns Promise<FileProperties> with fulfilled resolution and url fields
	 */
	private async getImagePreview(fileURL: string, width: number, height: number = width): Promise<IFileProperties> {
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
				reject('Can\'t read the image');
			};

			image.src = fileURL;
		});
	}

	/**
	 * Method which drawing video thumbnail
	 * @param fileURL A url of a video file you want to get a thumbnail from
	 * @param width width of a needed thumbnail
	 * @param height heidht of a needed thumbnail (Default equal to width)
	 * @returns Promise<FileProperties> with fulfilled resolution, duration and url fields
	 */
	private async getVideoPreview(fileURL: string, width: number, height: number = width): Promise<IFileProperties> {
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
					console.log('can play');
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
				console.log('error');
			};

			videoElement.src = fileURL;
		});

	}

	private typeOfFile(file: File): string {
		return file.type.slice(0, file.type.search(/\//));
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
}
