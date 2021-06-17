import uuid from 'uuid';

import { createToken } from '../../../src/utils';

jest.mock('uuid', () => ({
  v4: jest
    .fn()
    .mockReturnValueOnce('dec714e3-143f-432f-be20-cdc6c8aef14e')
    .mockReturnValueOnce('16457a1c-23a8-47b1-9f56-2043c35df942'),
}));

describe('createToken', () => {
  const token = createToken();

  it('should return a token', () => {
    expect(typeof token).toBe('string');
    expect(token).toBe(
      'GVjNzE0ZTMtMTQzZi00MzJmLWJlMjAtY2RjNmM4YWVmMTRlLTE2NDU3YTFjLTIzYTgtNDdiMS05ZjU2LTIwNDNjMzVkZjk0Mg'
    );
  });

  it('should contain the correct number of characters', () => {
    expect(token.length).toBe(97);
  });

  it('should call v4 method twice', () => {
    expect(uuid.v4).toHaveBeenCalledTimes(2);
  });
});
