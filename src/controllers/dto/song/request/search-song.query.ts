import { Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchSongQuery {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(1, 100)
  query: string;
}
