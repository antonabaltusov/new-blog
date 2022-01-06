import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { CommentsModule } from './comments/comments.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  controllers: [NewsController],
  providers: [NewsService],
  imports: [CommentsModule, MailModule],
  exports: [NewsService],
})
export class NewsModule {}
