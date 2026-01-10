export class SimilarityCalculator {
  private static readonly NEUTRAL_SCORE = 1200;

  /**
   * Calculates the Centered Cosine Similarity between two user preference vectors.
   * Steps:
   * 1. Align vectors (union of keys).
   * 2. Fill missing values with NEUTRAL_SCORE (1200).
   * 3. Center values (subtract 1200).
   * 4. Compute Cosine Similarity.
   *
   * @param vectorA Record of mediaId -> score
   * @param vectorB Record of mediaId -> score
   * @returns Similarity score between -1 and 1
   */
  static calculate(
    vectorA: Record<string, number>,
    vectorB: Record<string, number>,
  ): number {
    const keys = new Set([...Object.keys(vectorA), ...Object.keys(vectorB)]);

    if (keys.size === 0) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const key of keys) {
      const valA = (vectorA[key] ?? this.NEUTRAL_SCORE) - this.NEUTRAL_SCORE;
      const valB = (vectorB[key] ?? this.NEUTRAL_SCORE) - this.NEUTRAL_SCORE;

      dotProduct += valA * valB;
      normA += valA * valA;
      normB += valB * valB;
    }

    if (normA === 0 || normB === 0) {
      return 0; // Avoid division by zero
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
