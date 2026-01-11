import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Observable, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MovieSearchComponent } from './movie-search';
import { Movie, MovieService } from './services/movie.service';

describe('MovieSearchComponent', () => {
  let component: MovieSearchComponent;
  let fixture: ComponentFixture<MovieSearchComponent>;
  let movieService: MovieService;

  const mockMovies: Movie[] = [
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
    {
      id: 3,
      title: 'The Dark Knight',
      overview: 'Batman fights the Joker',
      poster_url: 'url3',
      release_year: 2008,
      genre: 'Action',
      director: 'Nolan',
    },
  ];

  beforeEach(async () => {
    const movieServiceMock = {
      getMovies: vi.fn().mockReturnValue(of(mockMovies)),
      searchMovies: vi.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [
        MovieSearchComponent,
        CommonModule,
        FormsModule,
        InputTextModule,
        ButtonModule,
        CardModule,
        SelectModule,
      ],
      providers: [{ provide: MovieService, useValue: movieServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieSearchComponent);
    component = fixture.componentInstance;
    movieService = TestBed.inject(MovieService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load movies on init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(movieService.getMovies).toHaveBeenCalled();
    expect(component.allMovies().length).toBe(3);
    expect(component.movies().length).toBe(3);
  });

  it('should display title correctly', () => {
    expect(component.title()).toBe('Películas');
  });

  it('should extract genres from movies', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.genres.length).toBe(2);
    expect(component.genres.map((g) => g.value)).toContain('Action');
    expect(component.genres.map((g) => g.value)).toContain('Sci-Fi');
  });

  it('should extract years from movies', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.years.length).toBe(3);
    expect(component.years.map((y) => y.value)).toContain(1999);
    expect(component.years.map((y) => y.value)).toContain(2008);
    expect(component.years.map((y) => y.value)).toContain(2010);
  });

  it('should sort genres alphabetically', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    const genreValues = component.genres.map((g) => g.value);
    expect(genreValues[0]).toBe('Action');
    expect(genreValues[1]).toBe('Sci-Fi');
  });

  it('should sort years in descending order', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    const yearValues = component.years.map((y) => y.value);
    expect(yearValues[0]).toBe(2010);
    expect(yearValues[1]).toBe(2008);
    expect(yearValues[2]).toBe(1999);
  });

  it('should search movies with query', async () => {
    const searchResults = [mockMovies[0]];
    vi.mocked(movieService.searchMovies).mockReturnValue(of(searchResults));

    fixture.detectChanges();
    await fixture.whenStable();
    component.searchQuery.set('Matrix');
    component.searchMovies();
    await fixture.whenStable();

    expect(movieService.searchMovies).toHaveBeenCalledWith('Matrix', null, null);
  });

  it('should search movies with genre filter', async () => {
    const searchResults = mockMovies.filter((m) => m.genre === 'Sci-Fi');
    vi.mocked(movieService.searchMovies).mockReturnValue(of(searchResults));

    fixture.detectChanges();
    await fixture.whenStable();
    component.selectedGenre.set('Sci-Fi');
    component.searchMovies();
    await fixture.whenStable();

    expect(movieService.searchMovies).toHaveBeenCalledWith('', 'Sci-Fi', null);
  });

  it('should search movies with year filter', async () => {
    const searchResults = mockMovies.filter((m) => m.release_year === 1999);
    vi.mocked(movieService.searchMovies).mockReturnValue(of(searchResults));

    fixture.detectChanges();
    await fixture.whenStable();
    component.selectedYear.set(1999);
    component.searchMovies();
    await fixture.whenStable();

    expect(movieService.searchMovies).toHaveBeenCalledWith('', null, 1999);
  });

  it('should search with all filters applied', async () => {
    vi.mocked(movieService.searchMovies).mockReturnValue(of([]));

    fixture.detectChanges();
    await fixture.whenStable();
    component.searchQuery.set('The');
    component.selectedGenre.set('Sci-Fi');
    component.selectedYear.set(1999);
    component.searchMovies();
    await fixture.whenStable();

    expect(movieService.searchMovies).toHaveBeenCalledWith('The', 'Sci-Fi', 1999);
  });

  it('should clear search and reload all movies', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    component.searchQuery.set('Matrix');
    component.selectedGenre.set('Sci-Fi');
    component.selectedYear.set(1999);

    component.clearSearch();
    await fixture.whenStable();

    expect(component.searchQuery()).toBe('');
    expect(component.selectedGenre()).toBeNull();
    expect(component.selectedYear()).toBeNull();
    expect(movieService.getMovies).toHaveBeenCalled();
  });

  it('should set isLoading flag during search', async () => {
    const asyncObservable = new Promise<Movie[]>((resolve) => {
      setTimeout(() => resolve([]), 10);
    });

    vi.mocked(movieService.searchMovies).mockReturnValue(
      new Observable((subscriber) => {
        asyncObservable.then((data) => {
          subscriber.next(data);
          subscriber.complete();
        });
      })
    );

    fixture.detectChanges();
    await fixture.whenStable();

    component.searchMovies();
    expect(component.isLoading()).toBe(true);

    await asyncObservable;
    await fixture.whenStable();
    expect(component.isLoading()).toBe(false);
  });

  it('should handle error loading movies', async () => {
    vi.mocked(movieService.getMovies).mockReturnValue(throwError(() => new Error('Network error')));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    fixture.detectChanges();
    await fixture.whenStable();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading movies:', expect.any(Error));
    expect(component.isLoading()).toBe(false);
    consoleErrorSpy.mockRestore();
  });

  it('should handle error during search', async () => {
    vi.mocked(movieService.searchMovies).mockReturnValue(
      throwError(() => new Error('Search error'))
    );
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    fixture.detectChanges();
    await fixture.whenStable();
    component.searchMovies();
    await fixture.whenStable();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error searching movies:', expect.any(Error));
    expect(component.isLoading()).toBe(false);
    consoleErrorSpy.mockRestore();
  });

  it('should initialize with empty signals', () => {
    expect(component.movies()).toEqual([]);
    expect(component.allMovies()).toEqual([]);
    expect(component.searchQuery()).toBe('');
    expect(component.selectedGenre()).toBeNull();
    expect(component.selectedYear()).toBeNull();
    expect(component.isLoading()).toBe(false);
  });
});
