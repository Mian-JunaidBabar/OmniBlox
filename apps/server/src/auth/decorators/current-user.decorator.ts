import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentCompanyId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.companyId) {
      throw new Error('Company ID not found in request user');
    }

    return user.companyId;
  },
);

export const GetCurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const GetCurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new Error('User ID not found in request user');
    }

    return user.id;
  },
);
