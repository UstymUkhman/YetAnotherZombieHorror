const WebGLRenderer = jest.fn().mockImplementation(() => {
  const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');

  return {
    shadowMap: { enabled: false },
    setPixelRatio: jest.fn(),
    domElement: canvas,

    setSize: jest.fn(),
    dispose: jest.fn(),
    render: jest.fn()
  };
});

export { WebGLRenderer };
