class ImageBitmapLoader {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  public setOptions (options: unknown): ImageBitmapLoader {
    return this;
  }

  public setPath (path: string): ImageBitmapLoader {
    return this;
  }

  public load (
    url: string,
    onLoad?: (response: ImageBitmap) => void,
    onProgress?: (request: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void): unknown {
    return this;
  }

  /* eslint-enable @typescript-eslint/no-unused-vars */
}

export { ImageBitmapLoader };
