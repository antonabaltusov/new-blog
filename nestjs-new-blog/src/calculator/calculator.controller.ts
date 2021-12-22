import { Controller, Put, Query, Req } from '@nestjs/common';
import { CalculatorService } from './calculator.service';
interface Request extends Body {
  readonly cache: RequestCache;
  readonly credentials: RequestCredentials;
  readonly destination: RequestDestination;
  readonly headers: Headers;
  readonly integrity: string;
  readonly keepalive: boolean;
  readonly method: string;
  readonly mode: RequestMode;
  readonly redirect: RequestRedirect;
  readonly referrer: string;
  readonly referrerPolicy: ReferrerPolicy;
  readonly signal: AbortSignal;
  readonly url: string;
  clone(): Request;
}

@Controller('calculator')
export class CalculatorController {
  constructor(private readonly calculatorService: CalculatorService) {}

  @Put()
  count(
    @Req() request: Request,
    @Query('a') a: string,
    @Query('b') b: string,
  ): number | string {
    const aInt = parseInt(a);
    const bInt = parseInt(b);
    return this.calculatorService.count(
      request.headers['type-operation'],
      aInt,
      bInt,
    );
  }
}
