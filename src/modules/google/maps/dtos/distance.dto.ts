import { Expose, Transform } from 'class-transformer';

class Distance {
  @Expose()
  text: string;

  @Expose()
  value: number;
}

export class DistanceDto {
  @Expose({
    name: 'destination_addresses',
  })
  @Transform(({ value }) => value[0])
  destination: string;

  @Expose({
    name: 'origin_addresses',
  })
  @Transform(({ value }) => value[0])
  origin: string;

  @Expose({
    name: 'rows',
  })
  @Transform(({ value }) => value[0].elements[0].distance)
  distance: Distance;
}
