const characterGrid = document.getElementById("character-grid");

const firstPageButton = document.getElementById("first-page-button");
const previousPageButton = document.getElementById("previous-page-button");
const currentPageButton = document.getElementById("current-page-button");
const nextPageButton = document.getElementById("next-page-button");
const lastPageButton = document.getElementById("last-page-button");
const firstPageButtonSeparator = document.getElementById("page-button-first-separator");
const secondPageButtonSeparator = document.getElementById("page-button-second-separator");
const pageControllerWrapper = document.getElementById("page-controller-wrapper");
const pageControllerCloneWrapper = document.getElementById("page-controller-clone-wrapper");

const nameFilter = document.getElementById("name-filter");
const speciesFilter = document.getElementById("species-filter");
const typeFilter = document.getElementById("type-filter");

const statusTranslations = {
    'Alive': 'Vivo',
    'Dead': 'Muerto',
    'unknown': 'Desconocido',
}
const genderTranslations = {
    'Male': 'Hombre',
    'Female': 'Mujer',
    'Genderless': 'Sin género',
    'unknown': 'Desconocido',
}

const POSSIBLE_FILTERS = [
    'name',
    'status',
    'species',
    'type',
    'gender'
]

var currentPage = 1; // por alguna razón más allá de mi entendimiento, la paginación de esta API arranca a partir de 1 en vez de 0
var lastPage = 100;
var currentFilters = {}

nameFilter.addEventListener('change', (event) => {
// readFiltersAndUpdate()
});

document.getElementById("filter-form").addEventListener('submit', event => {
    // Evitar que se haga una solicitud GET cuando damos enter
    event.preventDefault();
})

function readFiltersAndUpdate() {
    readFilters()
    loadAfterFilterChange()
}

function readFilters() {
    if(nameFilter.value) currentFilters['name'] = nameFilter.value; else delete currentFilters.name;

    var selectedStatus = document.querySelector("input[name='status-filter']:checked").value;
    if(selectedStatus && selectedStatus!=='') currentFilters['status'] = selectedStatus; else delete currentFilters['status'];

    if(speciesFilter.value) currentFilters.species = speciesFilter.value; else delete currentFilters.species;
    if(typeFilter.value) currentFilters.type = typeFilter.value; else delete currentFilters.type;

    var selectedGender = document.querySelector("input[name='gender-filter']:checked").value;
    if(selectedGender && selectedGender!=='') currentFilters['gender'] = selectedGender; else delete currentFilters['gender'];
}


function clearGrid() {
    let grid = document.getElementsByClassName("character-grid");
    characterGrid.innerHTML = "";
}

function appendCharacterCard(characterInfo) {
    let card = document.createElement("div");
    card.classList.add("character-card")
    let cardImageDiv = document.createElement("div");
    cardImageDiv.classList.add("character-card-image");
    let cardImage = document.createElement("img");
    cardImage.src = characterInfo['image'];
    cardImageDiv.append(cardImage);
    card.append(cardImageDiv);
    let cardInfoDiv = document.createElement("div");
    cardInfoDiv.classList.add("character-card-info");
    let nameDiv = document.createElement("div");
    let nameSpan = document.createElement("span");
    nameSpan.innerText = characterInfo['name'];
    nameSpan.classList.add("cc-name");
    nameDiv.append(nameSpan);
    cardInfoDiv.append(nameDiv);

    let statsDiv = document.createElement("div");
    statsDiv.classList.add("cc-stats");

    function addStat(statName, statValue) {
        let statDiv = document.createElement("div");
        statDiv.classList.add("cc-stat");
        let nameSpan = document.createElement("span");
        let valueSpan = document.createElement("span");
        nameSpan.classList.add('cc-stat-name');
        valueSpan.classList.add('cc-stat-value');
        nameSpan.textContent = statName;
        valueSpan.textContent = statValue;
        if(statValue==="") {
            valueSpan.textContent = "N/A";
        }
        statDiv.append(nameSpan);
        statDiv.append(valueSpan);
        statsDiv.append(statDiv);
    }

    addStat("Estado", statusTranslations[characterInfo['status']]);
    addStat("Especie", characterInfo['species']);
    addStat("Tipo", characterInfo['type']);
    addStat("Género", genderTranslations[characterInfo['gender']]);
    addStat("Origen", characterInfo['origin']['name']);
    addStat("Ubicación", characterInfo['location']['name']);
    addStat("Episodios", characterInfo['episode'].length);
    cardInfoDiv.append(statsDiv);
    card.append(cardInfoDiv)
    characterGrid.append(card);
}

function updatePageControls() {
    firstPageButton.innerText = "1";
    firstPageButton.onclick = () => changePage(1);
    firstPageButton.style.display = (currentPage <= 2 ? "none" : "flex")
    firstPageButtonSeparator.style.display = (currentPage <= 2 ? "none" : "flex")

    previousPageButton.innerText = `${currentPage - 1}`;
    previousPageButton.onclick = () => changePage(currentPage - 1);
    previousPageButton.style.display = (currentPage <= 1 ? "none" : "flex")

    currentPageButton.innerText = `${currentPage}`;

    nextPageButton.innerText = `${currentPage + 1}`;
    nextPageButton.onclick = () => changePage(currentPage + 1);
    if (currentPage >= lastPage) {
        nextPageButton.style.display = "none";
    } else {
        nextPageButton.style.display = "flex";
    }

    secondPageButtonSeparator.style.display = (currentPage >= lastPage-1 ? "none" : "flex");
    lastPageButton.innerText = `${lastPage}`;
    lastPageButton.onclick = () => changePage(lastPage);
    lastPageButton.style.display = (currentPage >= lastPage-1 ? "none" : "flex");
}

function changePage(page) {
    loadPage(page, currentFilters);
}

function loadAfterFilterChange() {
    loadPage(1, currentFilters)
}

function loadPage(page, filters) {
    currentPage = page;
    let url = `https://rickandmortyapi.com/api/character?page=${page}`;
    if(filters) {

    POSSIBLE_FILTERS.forEach(p=>{
        if(!filters[p]) return;
        let filterValue = filters[p];
        url += `&${p}=${filterValue}`;
    });
    }
    clearGrid();
    fetch(url)
        .then(response => response.json())
        .then(data => {
            lastPage = data['info']['pages']
            data['results'].forEach(character => {
                appendCharacterCard(character);
            })
            updatePageControls();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

