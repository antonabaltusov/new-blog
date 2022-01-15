import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    try {
      const client = context.switchToWs().getClient();
      const authToken: string =
        client.handshake.headers.authorization.split(' ')[1];
      const isAuth = await this.authService.verify(authToken);
      if (isAuth) {
        const user = await this.authService.decode(authToken);
        context.switchToWs().getClient().data.user = user;
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }
}
