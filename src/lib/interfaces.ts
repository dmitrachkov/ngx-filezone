export interface FileProperties {
	size?: number;
	name?: string;
	extention?: string;
	type?: string;
	duration?: string;
	resolution?: string;
	url?: string;
}

export interface DrawImageParameters {
	dx: number;
	dy: number;
	dw: number;
	dh: number;
}

export interface AcceptMediaList {
	all: string[];
	mediaType: string[];
	fileExtension: string[];
}

export interface FileError {
	error: number;
	file: File;
}
