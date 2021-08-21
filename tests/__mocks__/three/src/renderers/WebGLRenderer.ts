export const WebGLRenderer = jest.fn().mockImplementation(() => {
  const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');

  return {
    shadowMap: { enabled: false },
    getRenderTarget: jest.fn(),
    setRenderTarget: jest.fn(),

    getClearColor: jest.fn(),
    setClearColor: jest.fn(),
    setPixelRatio: jest.fn(),

    domElement: canvas,

    compile: jest.fn(),
    setSize: jest.fn(),
    dispose: jest.fn(),
    render: jest.fn()
  };
});
