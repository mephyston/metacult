export class ExternalReference {
    constructor(
        public readonly provider: string,
        public readonly id: string
    ) {
        if (!provider) throw new Error('ExternalReference must have a provider');
        if (!id) throw new Error('ExternalReference must have an id');
    }
}
