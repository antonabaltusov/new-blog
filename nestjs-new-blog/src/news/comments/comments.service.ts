import { Injectable } from '@nestjs/common';
import { getRandomInt } from '../news.service';

export type Comment = {
  id?: number;
  message: string;
  author: string;
  avatar?: string;
  reply?: Comment[];
  blockcomment?: boolean;
};

interface CommentsBase {
  [key: string]: Comment[];
}

export type EditComment = {
  message?: string;
  author?: string;
};

@Injectable()
export class CommentsService {
  private readonly comments: CommentsBase = {
    2: [
      // {
      //   id: 2,
      //   message: 'wtf',
      //   author: 'smn',
      //   avatar: 
      // },
    ],
  };

  create(idNews: number, comment: Comment, idComment?: number) {
    if (!this.comments[idNews]) {
      this.comments[idNews] = [];
    }

    if (idComment) {
      const indexComment = this.comments[idNews].findIndex(
        (c) => c.id === idComment,
      );
      if (indexComment !== -1) {
        if (!this.comments[idNews][indexComment].reply) {
          this.comments[idNews][indexComment].reply = [];
        }
        comment.blockcomment = true;
        this.comments[idNews][indexComment].reply?.push(comment);
        return 'ответ на комментарий был создан';
      }
      return 'комментарий на который хотели ответить не существует';
    }

    this.comments[idNews].push({ ...comment, id: getRandomInt() });
    return 'комментарий был создан';
  }

  find(idNews: number): Comment[] | undefined {
    return this.comments[idNews] || undefined;
  }

  remove(idNews: number, idComment: number): Comment[] | false {
    if (!this.comments[idNews]) {
      return false;
    }
    const indexComment = this.comments[idNews].findIndex(
      (c) => c.id === idComment,
    );
    if (indexComment === -1) {
      return false;
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
      (c: Comment) => c.id === idComment,
    );

    if (indexComment !== -1) {
      this.comments[idNews][indexComment] = {
        ...this.comments[idNews][indexComment],
        ...editComment,
      };
      return true;
    }
    return false;
  }
}
