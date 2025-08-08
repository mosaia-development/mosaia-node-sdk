import { isTimestampExpired } from '../../utils';

describe('isTimestampExpired', () => {
  it('should return true for expired timestamps', () => {
    const pastTimestamp = (Date.now() - 1000).toString();
    expect(isTimestampExpired(pastTimestamp)).toBe(true);
  });

  it('should return false for future timestamps', () => {
    const futureTimestamp = (Date.now() + 1000).toString();
    expect(isTimestampExpired(futureTimestamp)).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isTimestampExpired('')).toBe(false);
  });

  it('should return false for whitespace string', () => {
    expect(isTimestampExpired('   ')).toBe(false);
  });

  it('should return false for invalid timestamp strings', () => {
    expect(isTimestampExpired('invalid')).toBe(false);
    expect(isTimestampExpired('abc123')).toBe(false);
    expect(isTimestampExpired('123.456')).toBe(false);
  });

  it('should handle the specific example timestamp', () => {
    const exampleTimestamp = '1754078962511';
    // This timestamp is now in the past, so it should be true (expired) for current time
    expect(isTimestampExpired(exampleTimestamp)).toBe(true);
  });

  it('should handle very old timestamps', () => {
    const oldTimestamp = '1000000000000'; // Year 2001
    expect(isTimestampExpired(oldTimestamp)).toBe(true);
  });

  it('should handle very future timestamps', () => {
    const futureTimestamp = '9999999999999'; // Year 2286
    expect(isTimestampExpired(futureTimestamp)).toBe(false);
  });
}); 