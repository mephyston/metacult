export class Rating {
    private readonly value: number;

    constructor(value: number) {
        if (value < 0 || value > 10) {
            throw new Error('Rating must be between 0 and 10');
        }
        this.value = value;
    }

    getValue(): number {
        return this.value;
    }
}
