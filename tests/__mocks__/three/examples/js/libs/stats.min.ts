export default jest.fn().mockImplementation(() => {
  const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');

  return {
    showPanel: jest.fn(),
    domElement: canvas,
    begin: jest.fn(),
    end: jest.fn()
  };
});
