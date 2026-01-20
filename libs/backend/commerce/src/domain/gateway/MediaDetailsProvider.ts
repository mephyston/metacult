export interface MediaDetails {
  id: string;
  title: string;
  type: 'movie' | 'tv' | 'game' | 'book';
  tmdbId?: string; // For Movies/TV
  isbn?: string; // For Books (future proof)
}

export interface MediaDetailsProvider {
  getMediaDetails(mediaId: string): Promise<MediaDetails | null>;
}
