import swapi from './swapi.js';

//Exemple d'inicialització de la llista de pel·lícules. Falten dades!
async function setMovieHeading(movieId, titleSelector, infoSelector, directorSelector) {
  // Obtenim els elements del DOM amb QuerySelector
  const title = document.querySelector(titleSelector);
  const info = document.querySelector(infoSelector);
  const director = document.querySelector(directorSelector)
  // Obtenim la informació de la pelicula
  const movieInfo = await swapi.getMovieInfo(movieId);
  // Modifico la informació
  title.innerHTML = movieInfo.name;
  info.innerHTML = `Episode ${movieInfo.episodeID} - ${movieInfo.release}`;
  director.innerHTML = `Director: ${movieInfo.director}`
}


async function initMovieSelect(selector) {
  // Recuperem les dades del servidor
  const movies = await swapi.listMoviesSorted();
  // Seleccionem el nostre element sobre el que haurem d'actuar (menú desplegable)
  const select = document.querySelector(selector);
  // Com que es tracta d'un select, haurem d'injectar "options" --> https://developer.mozilla.org/es/docs/Web/HTML/Element/select
  const option = document.createElement('option');
  // Inicialitzem amb el valor per defecte que ens demanen i injectem
  option.value = '';
  option.innerText = "Selecciona una pel·lícula";
  select.appendChild(option)
  
  // Ara com ho puc fer per anar posant la resta de pel·lícules... movies és un array amb la info no?
  // Un for of... o un map?
  for (const movie of movies){
    const option = document.createElement('option');
    option.value = movie.episodeID;
    option.innerText = movie.name;
    select.appendChild(option)
  }

  // O amb un map
  // movies.map(movie => {
  //   option.value = movie.episodeID;
  //   option.innerHTML = movie.name;
  //   select.appendChild(option.cloneNode(true));
  // })

}

function deleteAllCharacterTokens() {
  const listCharacters = document.querySelector('.list__characters')
  listCharacters.innerHTML= '';
}

// EVENT HANDLERS //

function addChangeEventToSelectHomeworld() {
  const selectHomeWorld = document.querySelector('#select-homeworld');
  selectHomeWorld.addEventListener('change', _createCharacterTokens);
}

async function _createCharacterTokens() {
  // Necessitem saber quina pel·lícula i quin planeta s'han sel·leccionat. 
  const selectMovie = document.querySelector('#select-movie');

  deleteAllCharacterTokens();

  // Obtenim el nostre objecte per adaptar a l'endpoint correcte 
  const movie = episodeToMovieIDs.find(({m, e}) => e == selectMovie.value);

  // Obtenim les dades de la película 
  const charactersAndHomeworlds = await swapi.getMovieCharactersAndHomeworlds(movie.m);

  const selectHomeWorld = document.querySelector('#select-homeworld');

  // Obtenim la llista de personatges que únicament son del planeta filtrat
  const characters = charactersAndHomeworlds.characters.filter((character) => character.homeworld === selectHomeWorld.value);

  console.log(characters);
  
  // Seleccionem l'ul on voldrem injectar la llista de personatges. 
  const ul = document.querySelector('.list__characters');
  
  characters.forEach((personatge) => {
    // Aquesta és l'estructura que hem d'aconseguir:
    // <li class="list__item item character">
    //           <img src="assets/user.svg" class="character__image" />
    //           <h2 class="character__name">Leia Skywalker</h2>
    //           <div class="character__birth">
    //             <strong>Birth Year:</strong> 19 BBY
    //           </div>
    //           <div class="character__eye"><strong>Eye color:</strong> Blue</div>
    //           <div class="character__gender"><strong>Gender:</strong> Male</div>
    //           <div class="character__home">
    //             <strong>Home World:</strong> Tatooine
    //           </div>
    // </li>
    // Hem d'afegir el nom del personatge... 

    let li = document.createElement('li');
    li.className = 'list__item item character';
    ul.appendChild(li);
    // Les imatges les tenim en local. Creem un element "img" i li assignem la url de la imatge
    let img = document.createElement('img');
    const urlArr = personatge.url.split("/");
    console.log(urlArr);
    const id = urlArr[urlArr.length-1];
    
    img.src = '/public/assets/people/'+id+".jpg";
    img.className = 'character__image';
    img.style.maxWidth = '100%'; // Add this line to set the maximum width to 100%
    li.appendChild(img);

    let h2 = document.createElement('h2');
    h2.className = 'character__name';
    h2.innerHTML = personatge.name;
    li.appendChild(h2);


    _addDivChild(
      li,
      'character__birth',
      '<strong>Birth Year:</strong> ' + personatge.birth_year
    );
    _addDivChild(
      li,
      'character__eye',
      '<strong>Eye color:</strong> ' + personatge.eye_color
    );
    _addDivChild(
      li,
      'character__gender',
      '<strong>Gender:</strong> ' + personatge.gender
    );
    _addDivChild(
      li,
      'character__home',
      '<strong>Home World:</strong> ' + personatge.homeworld
    );
  });
  }

function _addDivChild(parent, className, html) {
  let div = document.createElement('div');
  div.className = className;
  div.innerHTML = html;
  parent.appendChild(div);
}

function setMovieSelectCallbacks() {
  // Aquesta funcio ha d'implementar un eventListener sobre el selector de películes
  // 1. Obtenir l'element + 2. Afegir l'eventListener per quan canviï la opció. + 3. Callback a la funció qeu actualitza les dades amb la informació necessari
  const selectMovie = document.querySelector('#select-movie');
  // Podem gestionar la lògica en una funció auxiliar
  selectMovie.addEventListener('change', _handleOnSelectMovieChanged)
}

async function _handleOnSelectMovieChanged(event) {
  const selectHomeWorld = document.querySelector('#select-homeworld')
  selectHomeWorld.innerHTML = ''

  deleteAllCharacterTokens();

  // Obtenir el nou valor del selector
  const episodeID = event.target.value;
  // Cridar a la funció que em permet actualitzar les dades de la pel·lícula
  // COMPTE! episodiID != filmID!
  const movieID = _filmIdToEpisodeId(episodeID);
  const movieData = await swapi.getMovieInfo(movieID);
  // Actualitzem la informació del heading
  //_setMovieHeading(movieData)
  setMovieHeading(movieID,'.movie__title', '.movie__info', '.movie__director');
  // Recuperem la informació de 'homeworld' dels personatges
  const response = await swapi.getMovieCharactersAndHomeworlds(movieID);
  //Obting els homeworlds de tots els personatges de la peli
  const homeworlds = response.characters.map(
    (personatge) => personatge.homeworld
  )
  // Hi ha planetes repetits (diversos personatges amb el mateix 'homeworld')
  // Evitem duplicats i els ordenar alfabèticament
  const cleanHomeworlds = _removeDuplicatesAndSort(homeworlds);
  _populateHomeWorldSelector(cleanHomeworlds)  
 
}

function _filmIdToEpisodeId(episodeID) {
  for (let i in episodeToMovieIDs) {
    // Com que movieId és un string, fem servir el == per comparar (el valor però no el tipus!)
    if (episodeToMovieIDs[i].e == episodeID) {
      console.log("hola!")
      return episodeToMovieIDs[i].m;
    }
  }
}

// "https://swapi.dev/api/films/1/" --> Episode_id = 4 (A New Hope)
// "https://swapi.dev/api/films/2/" --> Episode_id = 5 (The Empire Strikes Back)
// "https://swapi.dev/api/films/3/" --> Episode_id = 6 (Return of the Jedi)
// "https://swapi.dev/api/films/4/" --> Episode_id = 1 (The Phantom Menace)
// "https://swapi.dev/api/films/5/" --> Episode_id = 2 (Attack of the Clones)
// "https://swapi.dev/api/films/6/" --> Episode_id = 3 (Revenge of the Sith)

let episodeToMovieIDs = [
  { m: 1, e: 4 },
  { m: 2, e: 5 },
  { m: 3, e: 6 },
  { m: 4, e: 1 },
  { m: 5, e: 2 },
  { m: 6, e: 3 },
];


//Enlloc de tractar els elements del heading de manera individual, podem sobreescriue l'html
//de tot el component directament fent ús de literals 
function _setMovieHeading({ name, episodeID, release, director }) {
  const movieHeader = document.querySelector('#movie-header');

  movieHeader.innerHTML = `
        <h2 class="movie__title">${name}</h2>
        <h4 class="movie__info">Episode ${episodeID} - ${release}</h4>
        <p class="movie__director">Director: ${director}</p>
    `;
}

function _populateHomeWorldSelector(homeworlds) {
  const selectHomeworld = document.querySelector('#select-homeworld')
  const option = document.createElement('option');
  option.innerText="Selecciona un planeta"
  selectHomeworld.appendChild(option)    

  homeworlds.forEach((homeworld) => {
    const option = document.createElement('option');
    option.value = homeworld;
    option.innerText = homeworld;
    selectHomeworld.appendChild(option)    
  });
}

/**
 * Funció auxiliar que podem reutilitzar: eliminar duplicats i ordenar alfabèticament un array.
 */
function _removeDuplicatesAndSort(elements) {
  // Al crear un Set eliminem els duplicats
  const set = new Set(elements);
  // tornem a convertir el Set en un array
  const array = Array.from(set);
  // i ordenem alfabèticament
  return array.sort(swapi._compareByName);
}

const act7 = {
  setMovieHeading,
  setMovieSelectCallbacks,
  initMovieSelect,
  deleteAllCharacterTokens,
  addChangeEventToSelectHomeworld,
};

export default act7;
