import { IsEnum, IsInt, IsString, IsOptional } from 'class-validator';

export class AdminGetArtistsQuery {
  @IsEnum(['latest', 'isOpen', 'songListCount'])
  sort: 'latest' | 'isOpen' | 'songListCount';

  @IsInt()
  index: number;

  @IsOptional()
  @IsString()
  search: string;
}
