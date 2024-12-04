import swapi from '../src/swapi';

describe('swapi', () => {
  describe('getMovieCount', () => {
    it('should return the number of movies', async () => {
      const count = await swapi.getMovieCount();
      expect(count).toBeGreaterThan(0);
    }, 15000); // Podeu variar el temps d'espera pel retorn de la promise
  });

  describe('listMovies', () => {
    it('should return an array of movie objects', async () => {
      const movies = await swapi.listMovies();
      expect(Array.isArray(movies)).toBe(true);
      expect(movies.length).toBeGreaterThan(0);
      expect(movies[0]).toHaveProperty('name');
      expect(movies[0]).toHaveProperty('director');
      expect(movies[0]).toHaveProperty('release');
      expect(movies[0]).toHaveProperty('episodeID');
    });
  });

  describe('listMoviesSorted', () => {
    it('should return an array of movie objects sorted by name', async () => {
      const movies = await swapi.listMoviesSorted();
      expect(Array.isArray(movies)).toBe(true);
      expect(movies.length).toBeGreaterThan(0);
      expect(movies[0]).toHaveProperty('name');
      expect(movies[0]).toHaveProperty('director');
      expect(movies[0]).toHaveProperty('release');
      expect(movies[0]).toHaveProperty('episodeID');
      expect(movies).toEqual(
        movies.slice().sort((a, b) => a.name.localeCompare(b.name))
      );
    });
  });

  describe('listEvenMoviesSorted', () => {
    it('should return an array of even movie objects sorted by episodeID', async () => {
      const movies = await swapi.listEvenMoviesSorted();
      expect(Array.isArray(movies)).toBe(true);
      expect(movies.length).toBeGreaterThan(0);
      expect(movies[0]).toHaveProperty('name');
      expect(movies[0]).toHaveProperty('director');
      expect(movies[0]).toHaveProperty('release');
      expect(movies[0]).toHaveProperty('episodeID');
      expect(movies).toEqual(
        movies
          .filter((movie) => movie.episodeID % 2 === 0)
          .sort((a, b) => a.episodeID - b.episodeID)
      );
    });
  });

  describe('getMovieInfo', () => {
    it('should return a movie object with name, episodeID, and characters', async () => {
      const movie = await swapi.getMovieInfo(1);
      expect(movie).toHaveProperty('name');
      expect(movie).toHaveProperty('episodeID');
      expect(movie).toHaveProperty('characters');
    });
  });

  describe('getCharacterName', () => {
    it('should return the name of a character given their URL', async () => {
      const name = await swapi.getCharacterName(
        'https://swapi.dev/api/people/1/'
      );
      expect(name).toBe('Luke Skywalker');
    });
  });

  describe('getMovieCharacters', () => {
    it('should return a movie object with name, episodeID, and an array of character names', async () => {
      const movie = await swapi.getMovieCharacters(1);
      expect(movie).toHaveProperty('name');
      expect(movie).toHaveProperty('episodeID');
      expect(Array.isArray(movie.characters)).toBe(true);
      expect(movie.characters.length).toBeGreaterThan(0);
      expect(typeof movie.characters[0]).toBe('string');
    });
  });

  describe('getMovieCharactersAndHomeworlds', () => {
    it('should return a movie object with name, episodeID, and an array of character objects with name and homeworld', async () => {
      const movie = await swapi.getMovieCharactersAndHomeworlds(1);
      expect(movie).toHaveProperty('name');
      expect(movie).toHaveProperty('episodeID');
      expect(Array.isArray(movie.characters)).toBe(true);
      expect(movie.characters.length).toBeGreaterThan(0);
      expect(typeof movie.characters[0]).toBe('object');
      expect(movie.characters[0]).toHaveProperty('name');
      expect(movie.characters[0]).toHaveProperty('homeworld');
    });
  });

  describe('Movie', () => {
    describe('getCharacters', () => {
      it('should return an array of character names', async () => {
        const movie = new Movie('A New Hope', [
          'https://swapi.dev/api/people/1/',
          'https://swapi.dev/api/people/2/',
        ]);
        const characters = await movie.getCharacters();
        expect(Array.isArray(characters)).toBe(true);
        expect(characters.length).toBeGreaterThan(0);
        expect(typeof characters[0]).toBe('string');
      });
    });

    describe('getHomeworlds', () => {
      it('should return an array of unique homeworld names', async () => {
        const movie = new Movie('A New Hope', [
          'https://swapi.dev/api/people/1/',
          'https://swapi.dev/api/people/2/',
        ]);
        const homeworlds = await movie.getHomeworlds();
        expect(Array.isArray(homeworlds)).toBe(true);
        expect(homeworlds.length).toBeGreaterThan(0);
        expect(typeof homeworlds[0]).toBe('string');
        expect(homeworlds).toEqual(
          homeworlds
            .slice()
            .sort()
            .filter((value, index, self) => self.indexOf(value) === index)
        );
      });
    });

    describe('getHomeworldsReverse', () => {
      it('should return an array of unique homeworld names sorted in reverse alphabetical order', async () => {
        const movie = new Movie('A New Hope', [
          'https://swapi.dev/api/people/1/',
          'https://swapi.dev/api/people/2/',
        ]);
        const homeworlds = await movie.getHomeworldsReverse();
        expect(Array.isArray(homeworlds)).toBe(true);
        expect(homeworlds.length).toBeGreaterThan(0);
        expect(typeof homeworlds[0]).toBe('string');
        expect(homeworlds).toEqual(
          homeworlds
            .slice()
            .sort()
            .reverse()
            .filter((value, index, self) => self.indexOf(value) === index)
        );
      });
    });
  });
});
