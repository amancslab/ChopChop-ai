import '@testing-library/jest-dom';

// Mock HTMLMediaElement prototype for video testing
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => {};
window.HTMLMediaElement.prototype.load = () => {};

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = () => {};
