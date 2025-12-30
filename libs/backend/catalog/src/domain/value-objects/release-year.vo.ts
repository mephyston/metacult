export class ReleaseYear {
    private readonly value: number;

    constructor(value: number) {
        if (value <= 1888) {
            throw new Error('ReleaseYear must be greater than 1888 (invention of first movie camera)');
        }
        const currentYear = new Date().getFullYear();
        if (value > currentYear) {
            throw new Error('ReleaseYear cannot be in the future');
        }
        this.value = value;
    }

    getValue(): number {
        return this.value;
    }
}
