import { ConfigModule } from '@nestjs/config';
import { CacheModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-store';

import { AppController } from './app.controller';
import { ThrottleGuard } from './guards/throttle.guard';

@Module({
    imports: [
        ConfigModule.forRoot(),
        CacheModule.register({
            ttl: +process.env.THROTTLE_TIMER,
            store: redisStore,
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
        })
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottleGuard
        }
    ]
})
export class AppModule {}
