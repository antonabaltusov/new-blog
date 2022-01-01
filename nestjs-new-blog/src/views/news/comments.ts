import { Comment } from '../../news/comments/comments.service';

export function renderComments(comments: Comment[]) {
  let commentsListHtml = '';
  for (const comment of comments) {
    commentsListHtml += renderCommentBlock(comment);
  }
  return commentsListHtml;
}

function renderCommentBlock(comment: Comment) {
  return `
    <div class="card">
      <div class="card-body">
      ${
        comment.avatar
          ? `<img src="http://localhost:3000${comment.avatar}" style="height: 200px; object-fit: cover;" class="card-img-top" alt="...">`
          : ''
      }
        <h5 class="card-title">${comment.author}</h5>
        <p class="card-text">${comment.message}</p>
        ${comment.blockcomment ? '' : '<a href="#" class="btn btn-primary">комментировать</a>'}
      </div>
      ${
        comment.reply
          ? `<p class="card-text">ответы:</p>${renderComments(comment.reply)}`
          : ''
      }
    </div>
  `;
}
