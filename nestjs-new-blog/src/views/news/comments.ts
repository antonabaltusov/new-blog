import { Comment } from '../../news/comments/comments.service';

export function renderComments(comments: Comment[]) {
  let commentsListHtml = '';
  for (const comment of comments) {
    commentsListHtml += renderCommentBlock(comment);
  }
  return `<h2>Комментарии</h2>
  ${commentsListHtml}
  `;
}

function renderCommentBlock(comment: Comment) {
  return `
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">${comment.author}</h5>
        <p class="card-text">${comment.message}</p>
        <a href="#" class="btn btn-primary">на будущее</a>
      </div>
    </div>
  `;
}
