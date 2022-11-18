import { SetMetadata } from '@nestjs/common';

export const Throttle = (cost: number) => {
    return SetMetadata('cost', cost);
};
