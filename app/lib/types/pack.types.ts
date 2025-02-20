export interface ProductCms {
  handle: string;
  id: string;
  data: {
    handle: string;
    images: {originalSrc: string; __typename: string}[];
    productType: string;
    status: string;
    title: string;
    __typename: string;
  };
}

export interface MediaCms {
  altText?: string;
  aspectRatio?: number;
  directory?: string;
  filename?: string;
  format?: string;
  height?: number;
  id?: string;
  mediaType?: string;
  previewSrc?: string;
  size?: number;
  src?: string;
  type?: string;
  url?: string;
  width?: number;
}

export interface LinkCms {
  url: string;
  text: string;
  newTab: boolean;
  isExternal: boolean;
  type: 'isPage' | 'isExternal' | 'isEmail' | 'isPhone';
}

export interface Swatch {
  name: string;
  color: string;
  image: MediaCms;
}

export interface SwatchesMap {
  [key: string]: Swatch;
}

export type Crop = 'center' | 'top' | 'bottom' | 'left' | 'right';

export interface Seo {
  title: string;
  description: string;
  image?: string;
  keywords?: string[];
  noFollow?: boolean;
  noIndex?: boolean;
}

export interface Status {
  started: boolean;
  finished: boolean;
  success: boolean;
}

export type Settings = Record<string, any>;

export type RootSiteSettings = Record<string, any>;
