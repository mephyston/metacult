import { faker } from '@faker-js/faker';
import {
    Game,
    Movie,
    type GameProps,
    type MovieProps,
} from '../entities/media.entity';
import { asMediaId } from '../value-objects/media-id.vo';
import { Rating } from '../value-objects/rating.vo';
import { CoverUrl } from '../value-objects/cover-url.vo';
import { ReleaseYear } from '../value-objects/release-year.vo';
import { ExternalReference } from '../value-objects/external-reference.vo';

export class MediaMother {
    static createGame(overrides?: Partial<GameProps>): Game {
        return new Game({
            id: asMediaId(overrides?.id ?? faker.string.uuid()),
            title: overrides?.title ?? faker.commerce.productName(),
            slug: overrides?.slug ?? faker.lorem.slug(),
            description: overrides?.description ?? faker.lorem.paragraph(),
            coverUrl:
                overrides?.coverUrl ?? new CoverUrl(faker.image.url()),
            rating: overrides?.rating ?? new Rating(faker.number.int({ min: 1, max: 10 })),
            releaseYear:
                overrides?.releaseYear ??
                new ReleaseYear(faker.date.past().getFullYear()),
            externalReference:
                overrides?.externalReference ??
                new ExternalReference('igdb', faker.string.numeric()),
            platform: overrides?.platform ?? ['PC', 'PS5'],
            developer: overrides?.developer ?? faker.company.name(),
            timeToBeat: overrides?.timeToBeat ?? faker.number.int({ min: 5, max: 100 }),
            ...overrides,
        });
    }

    static createMovie(overrides?: Partial<MovieProps>): Movie {
        return new Movie({
            id: asMediaId(overrides?.id ?? faker.string.uuid()),
            title: overrides?.title ?? faker.music.songName(),
            slug: overrides?.slug ?? faker.lorem.slug(),
            description: overrides?.description ?? faker.lorem.paragraph(),
            coverUrl:
                overrides?.coverUrl ?? new CoverUrl(faker.image.url()),
            rating: overrides?.rating ?? new Rating(faker.number.int({ min: 1, max: 10 })),
            releaseYear:
                overrides?.releaseYear ??
                new ReleaseYear(faker.date.past().getFullYear()),
            externalReference:
                overrides?.externalReference ??
                new ExternalReference('tmdb', faker.string.numeric()),
            director: overrides?.director ?? faker.person.fullName(),
            durationMinutes:
                overrides?.durationMinutes ?? faker.number.int({ min: 60, max: 180 }),
            ...overrides,
        });
    }

    // Helper builder for fluent usage if needed in future
    static builder() {
        // Simplistic builder returning the Mother for now
        return {
            game: (props?: Partial<GameProps>) => MediaMother.createGame(props),
            movie: (props?: Partial<MovieProps>) => MediaMother.createMovie(props),
        }
    }
}
