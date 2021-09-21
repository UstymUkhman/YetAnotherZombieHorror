export const ImageBitmapLoader = jest.fn().mockImplementation(() => {
  return {
    setOptions: jest.fn(),
    setPath: jest.fn(),
    fetch: jest.fn()
  };
});
