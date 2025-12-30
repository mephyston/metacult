export interface IMediaSearcher {
    search(query: string): Promise<any[]>;
}
