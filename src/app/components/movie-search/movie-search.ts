import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Movie, MovieService } from './services/movie.service';

@Component({
  selector: 'app-movie-search',
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, CardModule, SelectModule],
  templateUrl: './movie-search.html',
  styleUrl: './movie-search.scss',
})
export class MovieSearchComponent implements OnInit {
  readonly title = signal('Películas');
  private readonly movieService = inject(MovieService);

  movies = signal<Movie[]>([]);
  allMovies = signal<Movie[]>([]);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(false);
  selectedGenre = signal<string | null>(null);
  selectedYear = signal<number | null>(null);

  genres: { label: string; value: string }[] = [];
  years: { label: string; value: number }[] = [];

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.isLoading.set(true);
    this.movieService.getMovies().subscribe({
      next: (movies) => {
        this.allMovies.set(movies);
        this.movies.set(movies);
        this.extractFilters(movies);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading movies:', error);
        this.isLoading.set(false);
      },
    });
  }

  private extractFilters(movies: Movie[]): void {
    const uniqueGenres = [...new Set(movies.map((m) => m.genre).filter(Boolean))] as string[];
    this.genres = uniqueGenres
      .toSorted((a, b) => a.localeCompare(b))
      .map((genre) => ({ label: genre, value: genre }));

    const uniqueYears = [...new Set(movies.map((m) => m.release_year).filter(Boolean))] as number[];
    this.years = uniqueYears
      .toSorted((a: number, b: number) => b - a)
      .map((year) => ({ label: year.toString(), value: year }));
  }

  searchMovies(): void {
    this.isLoading.set(true);
    const query = this.searchQuery();
    const genre = this.selectedGenre();
    const year = this.selectedYear();

    this.movieService.searchMovies(query, genre, year).subscribe({
      next: (movies) => {
        this.movies.set(movies);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error searching movies:', error);
        this.isLoading.set(false);
      },
    });
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.selectedGenre.set(null);
    this.selectedYear.set(null);
    this.loadMovies();
  }
}
