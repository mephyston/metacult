export interface IAdsProvider {
    getAds(): Promise<any[]>;
}
