import { describe, expect, it } from 'bun:test';
import { SimilarityCalculator } from './similarity-calculator.service';

describe('SimilarityCalculator', () => {
  it('should return 1 for identical vectors', () => {
    const vec = { m1: 1400, m2: 1000 };
    // Centered: m1: +200, m2: -200
    expect(SimilarityCalculator.calculate(vec, vec)).toBeCloseTo(1, 5);
  });

  it('should return -1 for perfectly opposite vectors', () => {
    const vecA = { m1: 1400, m2: 1000 }; // +200, -200
    const vecB = { m1: 1000, m2: 1400 }; // -200, +200
    // Dot: (200 * -200) + (-200 * 200) = -40000 - 40000 = -80000
    // NormA: sqrt(40000 + 40000) = sqrt(80000)
    // NormB: sqrt(80000)
    // Result: -80000 / 80000 = -1
    expect(SimilarityCalculator.calculate(vecA, vecB)).toBeCloseTo(-1, 5);
  });

  it('should return 0 for orthogonal vectors', () => {
    // Values at 1200 contribute 0 after centering
    const vecA = { m1: 1400 }; // m1: +200, others 0
    const vecB = { m2: 1400 }; // m2: +200, others 0
    // Union: m1, m2
    // m1: A=200, B=0 (missing defaults to 1200 -> 0)
    // m2: A=0 (missing), B=200
    // Dot: (200*0) + (0*200) = 0
    expect(SimilarityCalculator.calculate(vecA, vecB)).toBe(0);
  });

  it('should handle empty vectors', () => {
    expect(SimilarityCalculator.calculate({}, {})).toBe(0);
  });

  it('should handle partial overlap', () => {
    const vecA = { m1: 1400, m2: 1400 }; // +200, +200
    const vecB = { m1: 1400, m3: 1400 }; // +200, +200
    // Union: m1, m2, m3
    // m1: 200, 200 -> 40000
    // m2: 200, 0 -> 0
    // m3: 0, 200 -> 0
    // Dot: 40000
    // NormA: sqrt(40000 + 40000) = sqrt(80000)
    // NormB: sqrt(40000 + 40000) = sqrt(80000)
    // Res: 40000 / 80000 = 0.5
    expect(SimilarityCalculator.calculate(vecA, vecB)).toBeCloseTo(0.5, 5);
  });
});
