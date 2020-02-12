import * as utils from '../util';

describe('Utilities', () => {
  describe('Utilities#getArbitrayPath', () => {
    const path = utils.getArbitrayPath('test');
    it('should return the current directory with "test" appended', () =>
      expect(path).toStrictEqual(`${process.cwd()}${utils.sep}test`)
    );
  });

  describe('Permission Utilities', () => {
    const permissions = 1 << 11;
    it('should return "sendMessages" from bytecode "1 << 11"', () =>
      expect(permissions).toStrictEqual('Send Messages')
    );
  });

  describe('Utilities#includesMarker', () => {
    const text = 'hi im a ${at}';
    it('should include marker', () =>
      expect(text).toStrictEqual(true)
    );
  });
});