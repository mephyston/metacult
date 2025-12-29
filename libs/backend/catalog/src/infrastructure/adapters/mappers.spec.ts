import { describe, it, expect } from 'bun:test';
import {
    mapMovieToEntity,
    mapTvToEntity,
    mapGameToEntity
} from './mappers';
import { MediaType } from '../../domain/entities/media.entity';

describe('Media Mappers', () => {

    describe('TMDB Mapper', () => {
        it('should map a TMDB Movie to a valid Movie entity', () => {
            const mockTmdbMovie = {
                id: 101,
                title: 'Inception',
                release_date: '2010-07-16',
                vote_average: 8.8,
                overview: 'A thief who steals corporate secrets...',
                poster_path: '/poster.jpg',
                backdrop_path: '/backdrop.jpg',
                director: 'Christopher Nolan',
                runtime: 148
            };

            const result = mapMovieToEntity(mockTmdbMovie as any);

            expect(result.type).toBe(MediaType.MOVIE);
            expect(result.title).toBe('Inception');
            expect((result.releaseYear as any).value).toBe(2010);
            expect((result.rating as any).value).toBe(8.8);
            expect(result.externalReference.id).toBe('101');
            expect(result.externalReference.provider).toBe('tmdb');

            // Specific Movie Checks
            expect(result.durationMinutes).toBe(148);
        });

        it('should map a TMDB TV Show to a valid TV entity', () => {
            const mockTmdbTv = {
                id: 202,
                name: 'Breaking Bad',
                first_air_date: '2008-01-20',
                vote_average: 9.5,
                overview: 'High school chemistry teacher...',
                poster_path: '/tv_poster.jpg',
                backdrop_path: '/tv_backdrop.jpg',
                created_by: [{ name: 'Vince Gilligan' }],
                number_of_episodes: 62,
                number_of_seasons: 5
            };

            const result = mapTvToEntity(mockTmdbTv as any);

            expect(result.type).toBe(MediaType.TV);
            expect(result.title).toBe('Breaking Bad');
            expect(result.creator).toBe('Vince Gilligan');
            expect(result.episodesCount).toBe(62);
            expect(result.seasonsCount).toBe(5);
            expect(result.externalReference.id).toBe('202');
            expect(result.externalReference.provider).toBe('tmdb');
        });

        it('should handle null poster_path gracefully (Edge Case)', () => {
            const mockTmdbMovie = {
                id: 103,
                title: 'Unknown Movie',
                poster_path: null
            };

            const result = mapMovieToEntity(mockTmdbMovie as any);
            expect(result.title).toBe('Unknown Movie');
            expect(result.coverUrl).toBeNull();
        });
    });

    describe('IGDB Mapper', () => {
        it('should correctly convert unix timestamp to Date object (ReleaseYear)', () => {
            const mockIgdbGame = {
                id: 303,
                name: 'The Witcher 3',
                first_release_date: 1431993600, // 2015-05-19
                total_rating: 92.5,
                platforms: [{ name: 'PC' }]
            };

            const result = mapGameToEntity(mockIgdbGame as any);

            expect(result.type).toBe(MediaType.GAME);
            expect(result.title).toBe('The Witcher 3');
            expect((result.releaseYear as any).value).toBe(2015);
            expect(result.platform).toEqual(['PC']);
            expect(result.externalReference.id).toBe('303');
            expect(result.externalReference.provider).toBe('igdb');
        });
    });
});
