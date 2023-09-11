import SimpleLightbox from 'simplelightbox';
import Notiflix from 'notiflix';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { servicePhoto, perPage } from './service';
const elements = {
  container: document.querySelector('.gallery'),
  tgt: document.querySelector('.search-form-js'),
  btnLoad: document.querySelector('.js-load-more'),
};
const gallery = document.querySelector('.gallery');
let page = 1;
let textInput = '';
let isFirstRequest = true; 
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});
elements.tgt.addEventListener('submit', hendlerSubmit);
elements.btnLoad.addEventListener('click', handlerLoadMore);
function handlerLoadMore() {
  page += 1;
  servicePhoto(page, textInput)
    .then(data => {
      console.log(data.totalHits);
      elements.container.insertAdjacentHTML('beforeend', createMurcup(data));
      if (data.totalHits / perPage <= page) {
        elements.btnLoad.classList.add('load-more-hidden');
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
      }
      console.log(data);
    })
    .catch(err => console.log(err));
}
function hendlerSubmit(evt) {
  evt.preventDefault();
  elements.container.innerHTML = '';
  textInput = evt.currentTarget.elements.searchQuery.value;
  servicePhoto(1, textInput)
    .then(response => {
      if (response.total === 0) {
        Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
      }
      // Виводимо повідомлення лише при першому запиті
      if (isFirstRequest) {
        Notiflix.Notify.success(`Hurray! We found ${response.totalHits} images.`);
        isFirstRequest = false;
      }
      const el = response.hits;
      return createMurcup(response);
    })
    .catch(err => console.log(err));
}
function createMurcup(array) {
  const resp = array.hits
    .map(data => {
      const {
        webformatURL,
        largeImageURL,
        tags,
        likes,
        comments,
        views,
        downloads,
      } = data;
      return `<div class="photo-card">
        <a href="${largeImageURL}">
      <img src="${webformatURL}" alt="${tags}" loading="lazy" width="300" height="200" />
      <div class="info">
        <p class="info-item">
          <b>Likes: </b><span class="numbers">${likes}</span>
        </p>
        <p class="info-item">
          <b>Views: </b><span class="numbers">${views}</span>
        </p>
        <p class="info-item">
          <b>Comments: </b><span class="numbers">${comments}</span>
        </p>
        <p class="info-item">
          <b>Downloads: </b><span class="numbers">${downloads}</span>
        </p>
      </div>
      </a>
    </div>
    `;
    })
    .join('');
  elements.container.insertAdjacentHTML('beforeend', resp);
  lightbox.refresh();
  if (array.totalHits > perPage) {
    elements.btnLoad.classList.replace('load-more-hidden', 'load-more');
  }
}