import { News } from '../../news/news.service';

export function renderNewsBlock(news: News) {
  return `
  <div class="card" style="width: 100%;">
    ${
      news.cover
        ? `<img src="${news.cover}" style="height: 200px; object-fit: cover;" class="card-img-top" alt="...">`
        : ''
    }
  
  <div class="card-body">
    <h5 class="card-title">${news.title}</h5>
    <h6 class="card-subtitle mb-2 text-muted">${news.author}</h6>
    <p class="card-text">${news.description}</p>
  </div>
</div>
  `;
}
