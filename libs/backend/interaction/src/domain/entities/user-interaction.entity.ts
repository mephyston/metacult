export enum InteractionAction {
    LIKE = 'LIKE',
    DISLIKE = 'DISLIKE',
    WISHLIST = 'WISHLIST',
    SKIP = 'SKIP'
}

export enum InteractionSentiment {
    BANGER = 'BANGER',
    GOOD = 'GOOD',
    OKAY = 'OKAY'
}

export class UserInteraction {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly mediaId: string,
        public readonly action: InteractionAction,
        public readonly sentiment: InteractionSentiment | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }
}
