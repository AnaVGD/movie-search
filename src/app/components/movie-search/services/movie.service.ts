import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { Observable, from, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Movie {
  id: number;
  title: string;
  overview?: string;
  poster_url: string;
  created_at?: string;
  release_year?: number;
  genre?: string;
  director?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  getMovies(): Observable<Movie[]> {
    return from(
      this.supabase.from('movies').select('*').order('created_at', { ascending: false })
    ).pipe(
      map((response) => {
        if (response.error) {
          console.error('Error fetching movies:', response.error);
          return [];
        }
        return response.data || [];
      })
    );
  }

  searchMovies(query: string, genre?: string | null, year?: number | null): Observable<Movie[]> {
    let q = this.supabase.from('movies').select('*');

    if (query.trim()) {
      q = q.ilike('title', `%${query}%`);
    }

    if (genre) {
      q = q.eq('genre', genre);
    }

    if (year) {
      q = q.eq('release_year', year);
    }

    return from(q).pipe(
      map((response) => {
        if (response.error) {
          console.error('Error searching movies:', response.error);
          return [];
        }
        return response.data || [];
      })
    );
  }
}
