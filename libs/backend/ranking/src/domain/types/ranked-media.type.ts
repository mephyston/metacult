export interface RankedMedia {
    id: string;
    title: string;
    eloScore: number;
    matchCount: number;
    coverUrl: string | null;
    providerMetadata?: any;
}
