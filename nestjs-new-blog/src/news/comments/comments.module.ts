import { forwardRef, Module } from '@nestjs/common';
import { NewsModule } from '../news.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
  imports: [forwardRef(() => NewsModule)],
})
export class CommentsModule {}
