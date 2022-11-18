import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    first() {
        return 1;
    }

    second() {
        return 2;
    }

    third() {
        return 3;
    }
}
