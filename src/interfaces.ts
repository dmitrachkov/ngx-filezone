export interface IFileProperties {
	size?: number;
	name?: string;
	extention?: string;
	type?: string;
	duration?: string;
	resolution?: string;
	url?: string;
}

export interface IDrawImageParameters {
	dx: number;
	dy: number;
	dw: number;
	dh: number;
}

export interface IAcceptMediaList {
	all: string[];
	mediaType: string[];
	fileExtension: string[];
}

export interface IFileError {
	error: number;
	file: File;
}
