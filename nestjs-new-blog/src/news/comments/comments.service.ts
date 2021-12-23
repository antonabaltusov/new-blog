import { Injectable } from '@nestjs/common';
import { getRandomInt } from '../news.service';

export type Comment = {
  id?: number;
  message: string;
  author: string;
};

@Injectable()
export class CommentsService {
  private readonly comments = {};

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

  removeAll(idNews: string): boolean {
    return delete this.comments?.[idNews];
  }
}
