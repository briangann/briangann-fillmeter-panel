import { waterColors } from './tankColors';

describe('waterColors', () => {
  it('returns cyan palette when tempC is null', () => {
    const c = waterColors(null, 20);
    expect(c.top).toBe('#22d3ee');
    expect(c.mid).toBe('#0284c7');
    expect(c.deep).toBe('#0c4a6e');
  });

  it('returns cyan palette below 15°C', () => {
    const c = waterColors(10, 20);
    expect(c.top).toBe('#22d3ee');
    expect(c.mid).toBe('#0284c7');
    expect(c.deep).toBe('#0c4a6e');
  });

  it('returns orange palette above threshold', () => {
    const c = waterColors(25, 20);
    expect(c.top).toBe('#fb923c');
    expect(c.mid).toBe('#ea580c');
    expect(c.deep).toBe('#7c2d12');
  });

  it('returns interpolated color between 15°C and threshold', () => {
    const c = waterColors(17.5, 20);
    expect(c.top).toMatch(/^rgb\(/);
    expect(c.mid).toMatch(/^rgb\(/);
    expect(c.deep).toMatch(/^rgb\(/);
  });

  it('interpolation r=0 at 15°C gives cyan', () => {
    const c = waterColors(15, 20);
    expect(c.top).toBe('#22d3ee');
  });
});
