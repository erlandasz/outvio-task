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

/*
    need to adjust this so point system could be implemented.

    need to adjust this so this would only take into account requests within given window of time.
    for example, if a user makes 10 requests in 1 second, then the 11th request would be blocked.
    if the user makes 10 requests in 10 seconds, then the 11th request would not be blocked.


    also move to a middleware
*/
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

    // TODO: refactor to avoid code duplication
    async validatePublicRequest(ip: string) {
        const key = `throttle:${ip}`;
        const limit = 5; // TODO move to env
        const ttl = +process.env.THROTTLE_MINUTES * 60;

        const current = ((await this.cacheManager.get(key)) as number) || 0;

        if (current >= limit) {
            throw new HttpException({ HttpStatus: HttpStatus.TOO_MANY_REQUESTS }, HttpStatus.TOO_MANY_REQUESTS);
        }

        await this.cacheManager.set(key, current + 1, ttl);

        return true;
    }

    async validateAuthenticatedRequest(token: string) {
        const key = `throttle:${token}`;
        const limit = 5;
        const ttl = 3600;

        const current = ((await this.cacheManager.get(key)) as number) || 0;

        if (current >= limit) {
            throw new HttpException({ HttpStatus: HttpStatus.TOO_MANY_REQUESTS }, HttpStatus.TOO_MANY_REQUESTS);
        }

        await this.cacheManager.set(key, current + 1, ttl);

        return true;
    }
}
