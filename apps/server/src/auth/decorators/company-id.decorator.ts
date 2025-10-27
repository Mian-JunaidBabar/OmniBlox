import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CompanyId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.companyId) {
      throw new Error('Company ID not found in request user');
    }

    return user.companyId;
  },
);
