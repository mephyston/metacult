export class MediaNotFoundError extends Error {
  constructor(ids: string[]) {
    super(`Media(s) not found for IDs: ${ids.join(', ')}`);
    this.name = 'MediaNotFoundError';
  }
}
