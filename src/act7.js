import swapi from './swapi.js';

//Exemple d'inicialització de la llista de pel·lícules. Falten dades!
async function setMovieHeading(movieId, titleSelector, infoSelector, directorSelector) {
  // Obtenim els elements del DOM amb QuerySelector
  const title = document.querySelector(titleSelector);  
  const info = document.querySelector(infoSelector)
  const director = document.querySelector(directorSelector)


  if (!movieId){
    title.innerHTML = ''
    info.innerHTML = ''
    director.innerHTML = ''
    return
  }
  // Obtenim la informació de la pelicula
  const movieInfo = await swapi.getMovieInfo(movieId);
  // Injectem
  title.innerHTML = movieInfo.name
  info.innerHTML = `Episode ${movieInfo.episodeID} - ${movieInfo.release}`
  director.innerHTML = `Director: ${movieInfo.director}`
}

async function initMovieSelect(selector) {
  // Recuperem les dades del servidor
  const movies = await swapi.listMoviesSorted();
  //console.log(movies)
  
  // Seleccionem el nostre element sobre el que hem d'actuar (menú desplegable "movies")
  const select = document.querySelector(selector);

  // Com que el primer element no forma part de la llista de pelis, vaig a fer-ho a mà
  const option = document.createElement('option')
  // Inicialitzo amb el valor per defecte que em demanen "Selecciona una pel·lícula"
  option.value = '';
  option.textContent = "Selecciona una pel·lícula" 
  select.appendChild(option)

  // Com ho faig per anar passant la resta de pel·lícules?
  // 'movies' és un array d'objectes per tant: for..of, map, foreach.
  
  movies.forEach(movie => {
    const option = document.createElement('option')
    option.value = _filmIdToEpisodeId(movie.episodeID)
    option.textContent = movie.name
    select.appendChild(option)
  })
}

// function deleteAllCharacterTokens() {
   // Ho hem implementat dins del handler -> _handleOnSelectMovieChanged
// }

function setMovieSelectCallbacks() {
  // Busquem l'identificador del selector de pel·lícules 
  const selectMovie = document.querySelector('#select-movie')
  // Cada vegada que canviem ('change') el valor del selector cridem a la funció _handleOnSelectMovieChanged
  // Sintaxi: element.addEventListener(event, function)
  selectMovie.addEventListener('change', _handleOnSelectMovieChanged)
}

async function addChangeEventToSelectHomeworld() {
  document.querySelector('.list__characters').innerHTML = '';
  const planeta = document.querySelector('#select-homeworld');
  planeta.addEventListener('change', _createCharacterTokens);
}

// EVENT HANDLERS //
async function _createCharacterTokens(event) {
  document.querySelector('.list__characters').innerHTML = '';

  // Necessitem saber quina pel·licula i quin planeta/homeworld s'han seleccionat! 
  const idPelicula = document.querySelector('#select-movie').value;
  //const selectHomeworld = document.querySelector('#select-homeworld').value;
  
  // Creem el llistat de personatges que injectarem a la ul del DOM
  const ul = document.querySelector('.list__characters');

  // Podríem implementar un control d'errors per si no s'ha seleccionat cap pel·lícula o planeta

  if (!idPelicula){
    throw Error('No movie selected.')
  }

  // if (!selectHomeworld){
  //   throw Error('No homeworld selected.')
  // }

  // Obtenim el llistat de 'characters' que ens retorna la pel·lícula que consultem
  let movieInfo = await swapi.getMovieCharactersAndHomeworlds(idPelicula);
  
  let filteredCaracters = movieInfo.characters.filter((caracter) => caracter.homeworld == event.target.value)
  console.log(filteredCaracters)
  
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

    filteredCaracters.map((personatge)=>{
      const li = document.createElement('li')
      //li.className = 'list__item item character',
      li.classList.add('list__item', 'item', 'character')
      ul.appendChild(li)
      // Les imatges les tenim en local. Hem de crear un element "img"
      const img = document.createElement('img')
  
      //Anem a introduir la imatge del personatge:
      const urlParts = personatge.url.split('/')
      const characterNumber = urlParts[urlParts.length - 1]
      // o també: 
      //const characterNumber = urlPart.pop()
      img.src = `../public/assets/people/${characterNumber}.jpg`
      img.className='character__image'
      img.style.maxWidth='100%'
      li.appendChild(img)

      // GHhem d'afegir el nom del personatge
      const h2 = document.createElement('h2')
      h2.classList.add('character__name')
      h2.innerHTML = personatge.name;
      li.appendChild(h2)

      // Ara tenim 4 divs que segueixen el mateix patró... podem optimitzar no?
    //           <div class="character__birth">
    //             <strong>Birth Year:</strong> 19 BBY
    //           </div> 
    
      // Podem crear una funció auxiliar que ens ajudi --> _addDivChiled
      // Necessitem passar-li el pare (per saber ON injectar), la classe del div i el contingut
      
      _addDivChild(li, 'character__birth', '<strong>Birth Year: </strong>' + personatge.birth_year  )
      _addDivChild(li, 'character__eye', '<strong>Eye color: </strong>' + personatge.eye_color )
      _addDivChild(li, 'character__gender', '<strong>Gender: </strong>' + personatge.gender )
      _addDivChild(li, 'character__home', '<strong>Homeworld: </strong>' + personatge.homeworld )
    })
}
  
function _addDivChild(parent, className, html) {
  const div = document.createElement('div')
  div.className = className
  div.innerHTML = html
  parent.appendChild(div)
}



async function _handleOnSelectMovieChanged(event) {
  // Obtenir el valor del selector que en aquest cas conté l'id de la peli
  const movieID = event.target.value
  // Modifiquem la capçalera amb la informació corresponent amb aquesta peli
  // Si existeix un "target"
    await setMovieHeading(movieID, '.movie__title', '.movie__info', '.movie__director');

  // Ex4--> Esborrem l'anterior llistat de planetes
    const selector = document.querySelector('#select-homeworld');
    selector.innerHTML = '';

  // Ex4 --> Ara pels planetes d'origen necessitem les dades de tots els personatges

  const caracters = await swapi.getMovieCharactersAndHomeworlds(movieID);
  //  Necessitem d'entrada una llista amb els planetes d'origen dels diferents personatges:
  const planetes = caracters.characters.map((caracter) => caracter.homeworld);

  // Evitem que apareguin duplicats amb la funció auxiliar
  const planetesNoDuplicats = _removeDuplicatesAndSort(planetes);

  // Amb la llista ja "neta" (i ordenada alfabèticament), podem cridar a la
  // funció que actualitza el selector de "homeworlds"
  _populateHomeWorldSelector(planetesNoDuplicats, selector);;

  document.querySelector('.list__characters').innerHTML = '';
    
}

function _filmIdToEpisodeId(episodeID) {
  const mapping = episodeToMovieIDs.find(item => item.e === episodeID)
  if (mapping){
    return mapping.m
  } else {
    return null
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

function _setMovieHeading({ name, episodeID, release, director }) {}

function _populateHomeWorldSelector(homeworlds, selector) {
  //console.log(homeworlds)
  // Aquí implementem la lògica per "poblar" o injectar els planetes al desplegable "homeworld"
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Selecciona un homeworld';
    selector.appendChild(option);

    homeworlds.forEach(planeta => {
      const option = document.createElement('option');
      option.value = planeta;
      option.textContent = planeta;
      selector.appendChild(option);
      })
}

/**
 * Funció auxiliar que podem reutilitzar: eliminar duplicats i ordenar alfabèticament un array.
 */
function _removeDuplicatesAndSort(elements) {
  // Al crear un Set eliminem els duplicats
  const set = new Set(elements);
  // tornem a convertir el Set en un array
  const array = [...set].sort();
  // i ordenem alfabèticament
  return array;
}


const act7 = {
  setMovieHeading,
  setMovieSelectCallbacks,
  initMovieSelect,
  //deleteAllCharacterTokens,
  addChangeEventToSelectHomeworld,
};

export default act7;