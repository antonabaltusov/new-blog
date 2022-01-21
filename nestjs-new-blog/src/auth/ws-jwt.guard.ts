import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    try {
      const client = context.switchToWs().getClient();
      const cookies: string[] = client.handshake.headers.cookie.split('; ');
      const jwt = cookies.find((c) => !c.indexOf('jwt')).split('=')[1];
      const isAuth = await this.authService.verify(jwt);
      if (isAuth) {
        const user = await this.authService.decode(jwt);
        context.switchToWs().getClient().data.user = user;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
