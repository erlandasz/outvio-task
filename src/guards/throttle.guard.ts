import {
    Injectable,
    CanActivate,
    ExecutionContext,
    CACHE_MANAGER,
    Inject,
    HttpStatus,
    HttpException
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ThrottleGuard implements CanActivate {
    private cost = 1;

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private reflector: Reflector
    ) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const req = context.switchToHttp().getRequest();

        const ip =
            req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        const isAuth = req.headers['token'] === process.env.AUTH_KEY;

        this.cost = this.reflector.get('cost', context.getHandler()) || 1;

        if (isAuth) {
            return this.validate(req.headers['token'], +process.env.AUTHENTICATED_THROTTLE_LIMIT);
        }

        return this.validate(ip, +process.env.PUBLIC_THROTTLE_LIMIT);
    }


    async validate(key: string, limit: number) {
        const remainder = (await this.cacheManager.get(key)) || limit;

        if (remainder < this.cost) {
            throw new HttpException(
                { HttpStatus: HttpStatus.TOO_MANY_REQUESTS },
                HttpStatus.TOO_MANY_REQUESTS
            );
        }

        await this.cacheManager.set(`throttle:${key}`, +remainder - this.cost);

        return true;
    }
}
