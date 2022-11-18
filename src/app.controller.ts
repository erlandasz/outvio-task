import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './guards/auth.guard';
import { Throttle } from './decorators/throttle.decorator';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post('/')
    @UseGuards(AuthGuard)
    first() {
        return this.appService.first();
    }

    @Get('/')
    @Throttle(2)
    second() {
        return this.appService.second();
    }

    @Get('/cache')
    @Throttle(15)
    third() {
        return this.appService.third();
    }
}
