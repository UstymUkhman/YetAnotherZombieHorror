export default jest.fn().mockImplementation(() => ({
  renderer: { background: null },
  setBackground: () => void 0,

  resize: () => void 0,
  start: () => void 0,
  stop: () => void 0
}));
