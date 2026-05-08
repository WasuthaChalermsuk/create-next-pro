const path = require('path');

const { startMockServer } = require('../src/lib/mock-server');

const mocksDir = path.join(process.cwd(), 'mocks');
startMockServer(mocksDir);
