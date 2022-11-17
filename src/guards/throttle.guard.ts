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
import { Observable } from 'rxjs';

@Injectable()
export class ThrottleGuard implements CanActivate {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        const ip =
            req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        const isAuth = req.headers['token'] == process.env.SOME_KEY;

        if (isAuth) {
            return this.validateAuthenticatedRequest(req.headers['token']);
        }

        return this.validatePublicRequest(ip);
    }

    async validatePublicRequest(ip: string) {
        const key = `throttle:${ip}`;

        return this.checkPoints(key, +process.env.PUBLIC_THROTTLE_LIMIT);
    }

    async validateAuthenticatedRequest(token: string) {
        const key = `throttle:${token}`;

        return this.checkPoints(key, +process.env.AUTHENTICATED_THROTTLE_LIMIT);
    }

    async checkPoints(key: string, limit: number) {
        const curr = JSON.parse(await this.cacheManager.get(key)) || {
            remaining: limit,
        };

        if (curr.remaining <= 0) {
            throw new HttpException(
                { HttpStatus: HttpStatus.TOO_MANY_REQUESTS },
                HttpStatus.TOO_MANY_REQUESTS
            );
        }

        console.log(curr)
        const cache = {
            ...curr,
            lastRequest: new Date().getTime(),
            remaining: curr.remaining - 1
        }

        await this.cacheManager.set(key, JSON.stringify(cache));

        return true;
    }
}
