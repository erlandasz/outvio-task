import { Controller, Get, Delete, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { Throttle } from './decorators/throttle.decorator';

@Controller()
export class AppController {
    @Post('/')
    @UseGuards(AuthGuard)
    first() {
        return 1
    }

    @Get('/')
    @Throttle(2)
    second() {
        return 2
    }

    @Delete('/')
    @Throttle(5)
    third() {
        return 3
    }
}
