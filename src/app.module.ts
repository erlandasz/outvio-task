import { ConfigModule } from '@nestjs/config';
import { CacheModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        ConfigModule.forRoot(),
        CacheModule.register({ ttl: +process.env.THROTTLE_TIMER, store: redisStore, host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }),
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
