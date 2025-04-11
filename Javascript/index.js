moviesSliced = movies.slice(0, 20);

const elMovieTemp = document.querySelector(".js-movie-template").content;
const elMovieList = document.querySelector(".js-movie-list");
const elMovieModal = document.querySelector(".js-movie-modal");
const elForm = document.querySelector(".js-form");
const elSearchInput = elForm.querySelector(".js-search-input");
const elCategoriesSelect = elForm.querySelector(".js-categories-select");
const elMinYearInput = elForm.querySelector(".js-min-year-input");
const elMaxYearInput = elForm.querySelector(".js-max-year-input");
const elSortSelect = elForm.querySelector(".js-sort-select");
const paginationContainer = document.querySelector(".js-pagination .pagination");


function calcRuntime(runtime) {
    return `${Math.floor(runtime / 60)}h ${Math.floor(runtime % 60)}m`
}

function renderMovies(arr) {
    let docFragment = document.createDocumentFragment();

    arr.forEach((movie) => {
        let clone = elMovieTemp.cloneNode(true);
        clone.querySelector(".js-movie-image").src = movie.img_url;
        clone.querySelector(".js-movie-title").textContent = movie.title;
        clone.querySelector(".js-movie-rating").textContent = movie.imdb_rating;
        clone.querySelector(".js-movie-year").textContent = movie.movie_year;
        clone.querySelector(".js-movie-runtime").textContent = calcRuntime(movie.runtime);
        clone.querySelector(".js-movie-categories").textContent = movie.categories.slice(0, 2).join(", ")
        clone.querySelector(".js-more-info").dataset.id = movie.imdb_id
        docFragment.append(clone);
    })
    elMovieList.innerHTML = ""
    elMovieList.append(docFragment);
}
// renderMovies(moviesSliced);

function renderFoundMovie(movie) {
    elMovieModal.querySelector(".js-movie-iframe").src = movie.movie_frame;
    elMovieModal.querySelector(".js-movie-modal-title").textContent = movie.title;
    elMovieModal.querySelector(".js-movie-rating").textContent = movie.imdb_rating;
    elMovieModal.querySelector(".js-movie-year").textContent = movie.movie_year;
    elMovieModal.querySelector(".js-movie-runtime").textContent = calcRuntime(movie.runtime);
    elMovieModal.querySelector(".js-movie-categories").textContent = movie.categories.join(", ")
    elMovieModal.querySelector(".js-movie-summary").textContent = movie.summary;
    elMovieModal.querySelector(".js-movie-imdb").href = movie.imdb_link;
}

function findUniqueCategories(movies) {
    return movies.reduce((acc, movie) => {
        movie.categories.forEach((category) => {
            if (!acc.includes(category)) {
                acc.push(category);
            }
        })
        return acc;
    }, [])
}

function renderCategories(arr) {
    let docFragment = document.createDocumentFragment();
    arr.forEach((category) => {
        let newOption = document.createElement("option");
        newOption.value = category;
        newOption.textContent = category;
        docFragment.append(newOption);
    })
    elCategoriesSelect.append(docFragment);
}
let uniqueCategories = findUniqueCategories(movies);
renderCategories(uniqueCategories);

function searchMovies(arr, regex, searchValue) {
    let filteredMovies;
    let res = arr.filter((movie) => {
        filteredMovies = (searchValue == "" || movie.title.match(regex)) && (elMinYearInput.value == "" || movie.movie_year >= elMinYearInput.value) &&
            (elMaxYearInput.value == "" || movie.movie_year <= elMaxYearInput.value) && (elCategoriesSelect.value == "all" || movie.categories.includes(elCategoriesSelect.value))
        return filteredMovies;
    })
    return res;
}

elMovieList.addEventListener("click", (evt) => {
    let elTarget = evt.target
    if (elTarget.matches(".js-more-info")) {
        let id = elTarget.dataset.id
        let foundMovie = movies.find((movie) => movie.imdb_id == id)
        renderFoundMovie(foundMovie);
    }
})

elForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    try {
        let searchValue = elSearchInput.value.trim().toLowerCase();
        let regex;
        if (searchValue.length) regex = new RegExp(searchValue, "gi");
        let filteredMovies = searchMovies(movies, regex, searchValue);

        filteredMovies.sort((a, b) => {
            let firstLetter = a.title.at(0).toLowerCase().charCodeAt(0);
            let secondLetter = b.title.at(0).toLowerCase().charCodeAt(0);
            if (elSortSelect.value == "a-z") {
                return firstLetter - secondLetter;
            } else if (elSortSelect.value == "z-a") {
                return secondLetter - firstLetter;
            } else if (elSortSelect.value == "old-year") {
                return a.movie_year - b.movie_year;
            } else if (elSortSelect.value == "new-year") {
                return b.movie_year - a.movie_year;
            }
        })
        renderMovies(filteredMovies);
    } catch (error) {
        return alert(error.message);
    }

})

let currentPage = 1;
const moviesPerPage = 20;

function prevBtn() {
    const prevLi = document.createElement("li");
    prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
    prevLi.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            updateMovies();
        }
    });
    paginationContainer.appendChild(prevLi);
}

function nextBtn(totalPages) {
    const nextLi = document.createElement("li");
    nextLi.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
    nextLi.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateMovies();
        }
    });
    paginationContainer.appendChild(nextLi);
}

function renderPaginationNumbers(startPage, endPage) {
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement("li");
        pageLi.className = `page-item ${currentPage === i ? "active" : ""}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageLi.addEventListener("click", () => {
            currentPage = i;
            updateMovies();
        });
        paginationContainer.appendChild(pageLi);
    }
}

function renderPagination(totalMovies) {
    const totalPages = Math.ceil(totalMovies / moviesPerPage);
    paginationContainer.innerHTML = "";

    const maxVisiblePages = 3;
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    prevBtn();

    renderPaginationNumbers(startPage, endPage);

    nextBtn(totalPages)
}

function updateMovies() {
    const startIndex = (currentPage - 1) * moviesPerPage;
    const endIndex = startIndex + moviesPerPage;
    const paginatedMovies = movies.slice(startIndex, endIndex);

    renderMovies(paginatedMovies);
    renderPagination(movies.length);
}

updateMovies();