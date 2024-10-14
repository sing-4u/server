import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({
    nullable: true,
    type: 'string',
    example: 'https://example.com/image.png',
  })
  image: string | null;

  @ApiProperty({ enum: ['OPENED', 'CLOSED'] })
  status: string;

  @ApiProperty({ enum: ['EMAIL', 'GOOGLE'] })
  provider: string;
}
