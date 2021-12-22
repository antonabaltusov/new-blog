import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NewsModule } from './news/news.module';
import { CalculatorModule } from './calculator/calculator.module';

@Module({
  imports: [NewsModule, CalculatorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
