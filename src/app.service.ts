import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class AppService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    async addSomethingToCache() {
        console.log(await this.cacheManager.store.keys());
        return true;
    }
}
