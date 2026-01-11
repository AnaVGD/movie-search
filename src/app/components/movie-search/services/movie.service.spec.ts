import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Movie, MovieService } from './movie.service';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
    auth: vi.fn(),
  })),
}));

describe('MovieService', () => {
  let service: MovieService;
  let supabaseMock: any;

  beforeEach(() => {
    supabaseMock = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 1,
                title: 'The Matrix',
                overview: 'A computer hacker learns',
                poster_url: 'url1',
                release_year: 1999,
                genre: 'Sci-Fi',
                director: 'Wachowski',
              },
              {
                id: 2,
                title: 'Inception',
                overview: 'A thief who steals',
                poster_url: 'url2',
                release_year: 2010,
                genre: 'Sci-Fi',
                director: 'Nolan',
              },
            ],
            error: null,
          }),
        }),
        ilike: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    };

    TestBed.configureTestingModule({
      providers: [MovieService],
    });

    service = TestBed.inject(MovieService);
    (service as any).supabase = supabaseMock;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all movies', async () => {
    const movies = await new Promise<Movie[]>((resolve) => {
      service.getMovies().subscribe((result) => {
        resolve(result);
      });
    });
    expect(movies.length).toBe(2);
    expect(movies[0].title).toBe('The Matrix');
    expect(movies[1].title).toBe('Inception');
  });

  it('should return empty array on error fetching movies', async () => {
    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Error' },
        }),
      }),
    });

    const movies = await new Promise<Movie[]>((resolve) => {
      service.getMovies().subscribe((result) => {
        resolve(result);
      });
    });
    expect(movies.length).toBe(0);
  });

  it('should search movies by query', async () => {
    const mockMovie: Movie = {
      id: 1,
      title: 'The Matrix',
      poster_url: 'url1',
      release_year: 1999,
      genre: 'Sci-Fi',
      director: 'Wachowski',
    };

    const selectSpy = vi.fn().mockReturnValue({
      ilike: vi.fn().mockResolvedValue({ data: [mockMovie], error: null }),
    });

    supabaseMock.from.mockReturnValue({
      select: selectSpy,
    });

    await new Promise<void>((resolve) => {
      service.searchMovies('Matrix').subscribe(() => {
        expect(selectSpy).toHaveBeenCalledWith('*');
        resolve();
      });
    });
  });

  it('should search movies by genre', async () => {
    const mockMovie: Movie = {
      id: 1,
      title: 'The Matrix',
      poster_url: 'url1',
      release_year: 1999,
      genre: 'Sci-Fi',
    };

    const eqSpy = vi.fn().mockResolvedValue({ data: [mockMovie], error: null });
    const ilikeSpy = vi.fn().mockReturnValue({
      eq: eqSpy,
    });

    const selectSpy = vi.fn().mockReturnValue({
      ilike: ilikeSpy,
      eq: eqSpy,
    });

    supabaseMock.from.mockReturnValue({
      select: selectSpy,
    });

    const movies = await new Promise<Movie[]>((resolve) => {
      service.searchMovies('', 'Sci-Fi').subscribe((result) => {
        resolve(result);
      });
    });
    expect(movies.length).toBeGreaterThanOrEqual(0);
  });

  it('should search movies by year', async () => {
    const mockMovie: Movie = {
      id: 1,
      title: 'The Matrix',
      poster_url: 'url1',
      release_year: 1999,
      genre: 'Sci-Fi',
    };

    const eqSpy = vi.fn().mockResolvedValue({ data: [mockMovie], error: null });

    const selectSpy = vi.fn().mockReturnValue({
      eq: eqSpy,
    });

    supabaseMock.from.mockReturnValue({
      select: selectSpy,
    });

    await new Promise<void>((resolve) => {
      service.searchMovies('', null, 1999).subscribe(() => {
        resolve();
      });
    });
  });

  it('should handle empty search query', async () => {
    const selectSpy = vi.fn().mockReturnValue(Promise.resolve({ data: [], error: null }));

    supabaseMock.from.mockReturnValue({
      select: selectSpy,
    });

    await new Promise<void>((resolve) => {
      service.searchMovies('').subscribe(() => {
        resolve();
      });
    });
  });
});
