import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

// Token fixo de propósito: o tema da trilha é documentação, não autenticação.
export const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? 'trilha-docs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (req.headers.authorization !== `Bearer ${ADMIN_TOKEN}`) {
      throw new UnauthorizedException('token de admin ausente ou inválido');
    }
    return true;
  }
}
