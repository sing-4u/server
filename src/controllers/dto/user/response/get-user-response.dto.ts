import { ApiProperty } from '@nestjs/swagger';
import { LinkDto } from './user-profile.dto';

export class GetUserResponseDto {
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

  @ApiProperty()
  isOpened: boolean;

  @ApiProperty({ type: 'string', nullable: true })
  bio: string | null;

  @ApiProperty({ type: 'string', nullable: true })
  cover: string | null;

  @ApiProperty({ type: LinkDto, isArray: true })
  links: LinkDto[];
}
