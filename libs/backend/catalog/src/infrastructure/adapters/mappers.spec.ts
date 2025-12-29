import { describe, it, expect } from 'bun:test';
import {
    mapMovieToEntity,
    mapTvToEntity,
    mapGameToEntity
} from './mappers';
import { MediaType } from '../../domain/entities/media.entity';

describe('Media Mappers', () => {

    describe('TMDB Mapper', () => {
        it('should map a TMDB Movie to a valid NewMedia + NewMovie entity', () => {
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

            expect(result.media.type).toBe(MediaType.MOVIE);
            // Note: Current mapper returns { media, movie } structure, not a single merged entity under 'type'.
            // Based on mappers.ts content: return { media: {...}, movie: {...} }
            expect(result.media.title).toBe('Inception');
            expect(result.media.releaseDate).toBeInstanceOf(Date);
            expect(result.media.releaseDate?.toISOString().split('T')[0]).toBe('2010-07-16');
            expect(result.media.globalRating).toBe(8.8);
            expect(result.media.providerMetadata).toEqual({
                source: 'TMDB',
                tmdbId: 101,
                mediaType: 'movie',
                movieRaw: mockTmdbMovie
            });

            // Specific Movie Checks
            // Mapper.ts: durationMinutes: raw.runtime
            expect(result.movie.durationMinutes).toBe(148);
        });

        it('should map a TMDB TV Show to a valid NewMedia + NewTv entity', () => {
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

            expect(result.media.type).toBe(MediaType.TV);
            expect(result.media.title).toBe('Breaking Bad');
            expect(result.tv.creator).toBe('Vince Gilligan');
            expect(result.tv.episodesCount).toBe(62);
            expect(result.tv.seasonsCount).toBe(5);
        });

        it('should handle null poster_path gracefully (Edge Case)', () => {
            const mockTmdbMovie = {
                id: 103,
                title: 'Unknown Movie',
                poster_path: null
            };

            const result = mapMovieToEntity(mockTmdbMovie as any);
            expect(result.media.title).toBe('Unknown Movie');
        });
    });

    describe('IGDB Mapper', () => {
        it('should correctly convert unix timestamp to Date object', () => {
            const mockIgdbGame = {
                id: 303,
                name: 'The Witcher 3',
                first_release_date: 1431993600, // 2015-05-19
                total_rating: 92.5,
                platforms: [{ name: 'PC' }]
            };

            const result = mapGameToEntity(mockIgdbGame as any);

            expect(result.media.type).toBe(MediaType.GAME);
            expect(result.media.title).toBe('The Witcher 3');
            expect(result.media.releaseDate).toBeInstanceOf(Date);
            expect(result.media.releaseDate?.toISOString().startsWith('2015-05-19')).toBe(true);
            expect(result.game.platform).toEqual(['PC']);
        });
    });
});
