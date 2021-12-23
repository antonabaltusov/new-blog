import { Injectable } from '@nestjs/common';
import { getRandomInt } from '../news.service';

export type Comment = {
  id?: number;
  message: string;
  author: string;
};

export type EditComment = {
  message?: string;
  author?: string;
};

@Injectable()
export class CommentsService {
  private readonly comments = {
    2: [
      {
        id: 2,
        message: 'wtf',
        author: 'smn',
      },
    ],
  };

  create(idNews: number, comment: Comment) {
    if (!this.comments[idNews]) {
      this.comments[idNews] = [];
    }
    this.comments[idNews].push({ ...comment, id: getRandomInt() });
    return 'комментарий был создан';
  }

  find(idNews: number): Comment[] | undefined {
    return this.comments[idNews] || undefined;
  }

  remove(idNews: number, idComment: number): Comment[] | undefined {
    if (!this.comments[idNews]) {
      return null;
    }
    const indexComment = this.comments[idNews].findIndex(
      (c) => c.id === idComment,
    );
    if (indexComment === -1) {
      return null;
    }
    return this.comments[idNews].splice(indexComment, 1);
  }

  removeAll(idNews: number): boolean {
    return delete this.comments?.[idNews];
  }

  edit(idNews: number, idComment: number, editComment: EditComment): boolean {
    if (!this.comments[idNews]) {
      return false;
    }

    const indexComment = this.comments[idNews].findIndex(
      (c) => c.id === idComment,
    );

    if (indexComment !== -1) {
      this.comments[idNews][indexComment] = {
        ...this.comments[idNews][indexComment],
        ...editComment,
      };
      console.log(this.comments[idNews][indexComment]);
      return true;
    }
    return false;
  }
}
