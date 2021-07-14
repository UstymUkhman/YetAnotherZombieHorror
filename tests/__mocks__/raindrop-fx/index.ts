export default jest.fn().mockImplementation(() => ({
  start: () => ({ then: () => void 0 }),
  renderer: { background: null },

  setBackground: () => void 0,
  resize: () => void 0,
  stop: () => void 0
}));
