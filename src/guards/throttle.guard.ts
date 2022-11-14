import {
    Injectable,
    CanActivate,
    ExecutionContext,
    CACHE_MANAGER,
    Inject
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
            this.validateAuthenticatedRequest(req.headers['token']);
        }

        return this.validatePublicRequest(ip);
    }

    async validatePublicRequest(ip: string) {
        const key = `throttle:${ip}`;
        const limit = 5;
        const ttl = 60000;

        const current = ((await this.cacheManager.get(key)) as number) || 0;

        if (current >= limit) {
            return false;
        }

        await this.cacheManager.set(key, current + 1, ttl);

        return true;
    }

    async validateAuthenticatedRequest(token: string) {
        const key = `throttle:${token}`;
        const limit = 10;
        const ttl = 60000;

        const current = ((await this.cacheManager.get(key)) as number) || 0;
        console.log({ current });
        console.log(await this.cacheManager.store.keys());
        if (current >= limit) {
            return false;
        }

        await this.cacheManager.set(key, current + 1, ttl);

        return true;
    }
}
