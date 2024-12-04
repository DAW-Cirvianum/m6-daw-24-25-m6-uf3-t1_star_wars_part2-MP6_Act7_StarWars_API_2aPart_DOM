import swapi from "./swapi.js";

async function setMovieHeading(
  movieId,
  titleSelector,
  infoSelector,
  directorSelector
) {
  // Obtenim els elements del DOM amb QuerySelector
  const title = document.querySelector(titleSelector);
  const info = document.querySelector(infoSelector);
  const director = document.querySelector(directorSelector);
  // Obtenim la informació de la pelicula
  const movieInfo = await swapi.getMovieInfo(movieId);
  // Injectem
  title.innerHTML = movieInfo.name;
  info.innerHTML = `Episode ${movieInfo.episodeID} - ${movieInfo.release}`;
  director.innerHTML = `Director: ${movieInfo.director}`;
}

async function initMovieSelect(selector) {
  // Recuperem les dades del servidor
  const movies = await swapi.listMoviesSorted();
  //console.log(movies);
  // Seleccionem el nostre element sobre el que haurem d'actuar (menú desplegable)
  const select = document.querySelector(selector);
  // Com que es tracta d'un select, haurem d'injectar "options" --> https://developer.mozilla.org/es/docs/Web/HTML/Element/select
  const option = document.createElement("option");
  // Inicialitzem amb el valor per defecte que ens demanen i injectem
  option.value = "";
  option.textContent = "Selecciona una pel·lícula";
  console.log(option);
  select.appendChild(option);

  // Ara com ho puc fer per anar posant la resta de pel·lícules... movies és un array amb la info no?
  // Un for of... o un map?
  for (const movie of movies) {
    const option = document.createElement("option");
    option.value = movie.episodeID;
    option.innerText = movie.name;
    select.appendChild(option);
  }

  // O amb un map
  // movies.map(movie => {
  //   option.value = movie.episodeID;
  //   option.innerHTML = movie.name;
  //   select.appendChild(option.cloneNode(true));
  // })

  // O amb un forEach
  // movies.forEach(movie => {
  //   option.value = movie.episodeID;
  //   option.innerHTML = movie.name;
  //   select.appendChild(option.cloneNode(true));
  // })
}

async function deleteAllCharacterTokens() {
  let listCharacters = document.querySelector(".list__characters");
  listCharacters.innerHTML = "";
}

// EVENT HANDLERS //

// Afegim l'event listener a l'element select-homeworld
function addChangeEventToSelectHomeworld() {
  let selectHomeworld = document.querySelector("#select-homeworld");
  selectHomeworld.addEventListener("change", _createCharacterTokens, false);
}

// CB de l'event listener
async function _createCharacterTokens() {
  // Necessitem saber quina pel·lícula i quin planeta s'han seleccionat
  let selectMovie = document.querySelector("#select-movie");
  let selectHomeworld = document.querySelector("#select-homeworld");

  // Podríem implementar un control d'errors per si no s'ha seleccionat cap pel·lícula o planeta
  // if (!selectMovie.value) {
  //   throw Error('No movie selected.');
  // }

  // if (!selectHomeworld.value) {
  //   throw Error('No homeworld selected.');
  // }

  // Ens assegurem que no hi ha cap token de personatge
  await deleteAllCharacterTokens();

  // Creem el llistat de personatges que injectarem a la ul del DOM
  var ul = document.querySelector(".list__characters");

  // Obtenim les dades de la pel·lícula i els personatges
  const value = _filmIdToEpisodeId(selectMovie.value);
  // Obtenim el valor del selector que en aquest cas contindrà el número d'episodi

  let data = await swapi.getMovieCharactersAndHomeworlds(value);
  // "data.characters" conté un array amb un objecte de tots els personatges de la pel·lícula
  // recordem que l'objecte personatges conté el planeta d'origen sota el nom: "homeworld". Filtrem doncs:
  let filteredCharacters = data.characters.filter(
    (character) => character.homeworld === selectHomeworld.value
  );

  // Ara ja puc iterar sobre els personatge i injectar-los
  filteredCharacters.map((personatge) => {
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

    let li = document.createElement("li");
    li.className = "list__item item character";
    ul.appendChild(li);
    // Les imatges les tenim en local. Creem un element "img" i li assignem la url de la imatge
    let img = document.createElement("img");

    //Anem a introduir la imatge del personatge
    // Imatge real:
    // Amb split separem la url per /
    const urlParts = personatge.url.split("/");
    const characterNumber = urlParts[urlParts.length - 1];
    img.src = `/assets/people/${characterNumber}.jpg`;

    // Imatge per defecte:
    //img.src = '/public/assets/user.svg'
    img.className = "character__image";
    img.style.maxWidth = "100%"; // Add this line to set the maximum width to 100%
    li.appendChild(img);

    // Hem d'afegir el nom del personatge...
    let h2 = document.createElement("h2");
    h2.className = "character__name";
    h2.innerHTML = personatge.name;
    li.appendChild(h2);

    // Ara tenim 4 divs que segueixen el mateix patró... podem optimitzar no?
    //           <div class="character__birth">
    //             <strong>Birth Year:</strong> 19 BBY
    //           </div>
    // En lloc de fer:

    // let div = document.createElement('div');
    // div.className = 'character__birth';
    // div.innerHTML = '<strong>Birth Year:</strong> ' + personatge.birth_year;
    // parent.appendChild(div);

    // Podem crear una funció auxiliar que ens ajudi a fer això --> _addDivChild
    // Necessitem passar-li el pare (per saber on injectar), la classe del div i el contingut

    _addDivChild(
      li,
      "character__birth",
      "<strong>Birth Year:</strong> " + personatge.birth_year
    );
    _addDivChild(
      li,
      "character__eye",
      "<strong>Eye color:</strong> " + personatge.eye_color
    );
    _addDivChild(
      li,
      "character__gender",
      "<strong>Gender:</strong> " + personatge.gender
    );
    _addDivChild(
      li,
      "character__home",
      "<strong>Home World:</strong> " + personatge.homeworld
    );
  });
}

function _addDivChild(parent, className, html) {
  let div = document.createElement("div");
  div.className = className;
  div.innerHTML = html;
  parent.appendChild(div);
}

function setMovieSelectCallbacks() {
  // Busquem l'identificador del selector de pelicules
  const selectMovie = document.querySelector("#select-movie");
  // Cada vegada que canviem ('change') el valor del selector cridem a la funció _handleOnSelectMovieChanged
  // Sintaxi: element.addEventListener(event, function, useCapture)
  selectMovie.addEventListener("change", _handleOnSelectMovieChanged, false);
}

async function _handleOnSelectMovieChanged(event) {
  // Ex4--> Esborrem l'anterior llistat de planetes i personatges, altrament afegirà a la llista dels ja presents
  const selectHomeworld = document.querySelector("#select-homeworld");
  selectHomeworld.innerHTML = "";
  // Ex4--> I també esborrem els tokens de personatges
  await deleteAllCharacterTokens();

  // Obtenim el valor del selector que en aquest cas contindrà el número d'episodi
  const episodeID = event.target.value;
  // Obtenim les dades de la pel·lícula, però compte episodiID != filmID! :(
  const movieID = _filmIdToEpisodeId(episodeID);

  const data = await swapi.getMovieInfo(movieID);
  // Actualitzem el header amb les dades de la pel·lícula
  _setMovieHeading(data);
  // Ex4 --> Ara pels planetes d'origen necessitem les dades de tots els personatges
  const response = await swapi.getMovieCharactersAndHomeworlds(movieID);
  // Necessitem d'entrada una llista amb els planetes d'origen dels diferents personatges:
  const homeworlds = response.characters.map(
    (character) => character.homeworld
  );
  // Ens passarà que hi haurà planetes repetits, així que els eliminem i els ordenem alfabèticament
  // Per si no ho fem en origen, evitem els duplicats i els ordenem alfabèticament
  const cleanHomeWorlds = _removeDuplicatesAndSort(homeworlds);
  // Amb la llista ordenada ja podem cridar a la funció que actualitza el selector de "homeworlds"
  _populateHomeWorldSelector(cleanHomeWorlds);
}

function _filmIdToEpisodeId(episodeID) {
  for (let list in episodeToMovieIDs) {
    // Com que movieId és un string, fem servir el == per comparar (el valor però no el tipus!)
    if (episodeToMovieIDs[list].e == episodeID) {
      return episodeToMovieIDs[list].m;
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

/**
 * Esta función actualiza el contenido del header de la aplicación.
 *
 * Dada una película se actualiza el html del header con los datos correctos.
 * En lugar de Jugar con todos los elementos del DOM individualmente sobreescribimos el html
 * de todo el componente directamente utilizando template literals.
 */
function _setMovieHeading({ name, episodeID, release, director }) {
  const movieHeader = document.querySelector("#movie-header");

  movieHeader.innerHTML = `
        <h2 class="movie__title">${name}</h2>
        <h4 class="movie__info">Episode ${episodeID} - ${release}</h4>
        <p class="movie__director">Director: ${director}</p>
    `;
}

function _populateHomeWorldSelector(homeworlds) {
  const selectHomeworld = document.querySelector("#select-homeworld");
  const option = document.createElement("option");
  option.innerText = "Selecciona un planeta";
  selectHomeworld.appendChild(option);

  homeworlds.forEach((homeworld) => {
    const option = document.createElement("option");
    option.value = homeworld;
    option.innerText = homeworld;
    selectHomeworld.appendChild(option);
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
  array.sort((a, b) => {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });
  return array;
}

const act7 = {
  setMovieHeading,
  setMovieSelectCallbacks,
  initMovieSelect,
  deleteAllCharacterTokens,
  addChangeEventToSelectHomeworld,
};

export default act7;
