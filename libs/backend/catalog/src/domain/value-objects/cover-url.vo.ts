export class CoverUrl {
    private readonly value: string;

    constructor(value: string) {
        if (!value.startsWith('https://')) {
            throw new Error('CoverUrl must be a valid URL starting with https://');
        }
        this.value = value;
    }

    getValue(): string {
        return this.value;
    }
}
