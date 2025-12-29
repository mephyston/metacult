export class CoverUrl {
    private readonly value: string;

    constructor(value: string) {
        if (!value.startsWith('http://') && !value.startsWith('https://')) {
            throw new Error('CoverUrl must be a valid URL starting with http:// or https://');
        }
        this.value = value;
    }

    getValue(): string {
        return this.value;
    }
}
