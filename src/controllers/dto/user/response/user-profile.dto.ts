import { ApiProperty } from '@nestjs/swagger';

export class LinkDto {
  @ApiProperty()
  linkName: string;

  @ApiProperty()
  url: string;
}

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    nullable: true,
    type: 'string',
    example: 'https://example.com/image.png',
  })
  image: string | null;

  @ApiProperty()
  isArtist: boolean;

  @ApiProperty({ type: 'string', nullable: true })
  bio: string | null;

  @ApiProperty({
    type: 'string',
    nullable: true,
    description: '대표 커버곡 링크',
  })
  cover: string | null;

  @ApiProperty({ type: LinkDto, isArray: true })
  links: LinkDto[];

  @ApiProperty()
  email: string;

  @ApiProperty()
  isOpened: boolean;

  @ApiProperty({ enum: ['EMAIL', 'GOOGLE'] })
  provider: string;
}
