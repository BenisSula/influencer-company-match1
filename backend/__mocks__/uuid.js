// Mock implementation of uuid for Jest tests
module.exports = {
  v4: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substring(7)),
};
