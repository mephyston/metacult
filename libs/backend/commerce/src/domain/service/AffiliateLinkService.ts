export class AffiliateLinkService {
  constructor(
    private readonly instantGamingRef?: string,
    private readonly amazonTag?: string,
  ) {}

  /**
   * Generates a search link for Instant Gaming with the affiliate referral code.
   * @param title - The title of the game.
   */
  generateInstantGamingLink(title: string): string {
    const refParam = this.instantGamingRef
      ? `&igr=${this.instantGamingRef}`
      : '';
    return `https://www.instant-gaming.com/fr/search/?q=${encodeURIComponent(title)}${refParam}`;
  }

  /**
   * Generates an Amazon search link for books with the affiliate tag.
   * @param title - The title of the book.
   */
  generateAmazonBookLink(title: string): string {
    const tagParam = this.amazonTag ? `&tag=${this.amazonTag}` : '';
    return `https://www.amazon.fr/s?k=${encodeURIComponent(title)}&i=stripbooks${tagParam}`;
  }

  /**
   * Appends the affiliate tag to the URL if the provider is supported.
   * @param url - The original URL.
   * @param provider - The provider name.
   */
  affiliateUrl(url: string, provider: string): string {
    const lowerProvider = provider.toLowerCase();

    // Amazon & Amazon Prime Video
    if (
      (lowerProvider.includes('amazon') ||
        lowerProvider.includes('prime video')) &&
      this.amazonTag
    ) {
      if (url.includes('tag=')) return url; // Already tagged
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}tag=${this.amazonTag}`;
    }

    // Apple TV (placeholder for future affiliate logic)
    // if (lowerProvider.includes('apple') && this.appleToken) { ... }

    return url;
  }
}
