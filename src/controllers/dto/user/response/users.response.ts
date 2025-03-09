import { ApiProperty } from '@nestjs/swagger';

class UserResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    example: 'https://example.com/image.png',
    nullable: true,
    type: 'string',
  })
  image: string | null;

  @ApiProperty()
  isOpened: boolean;
}

export class UsersResponse {
  @ApiProperty({ type: 'string', nullable: true })
  nextCursor: string | null;

  @ApiProperty({ type: UserResponse, isArray: true })
  users: UserResponse[];
}
