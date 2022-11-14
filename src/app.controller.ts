import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './guards/auth.guard';
import { ThrottleGuard } from './guards/throttle.guard';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @UseGuards(AuthGuard)
    @Post('/')
    guarded() {
        return {
            false: false
        };
    }

    @Get('/')
    public() {
        return {
            false: true
        }
    }

    @UseGuards(ThrottleGuard)
    @Get('/cache')
    cache() {
        return this.appService.addSomethingToCache();
    }
}
