import {
  IsNotEmpty,
  IsString,
  Length,
  IsUrl,
  Max,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 250)
  name: string;

  @IsOptional()
  @IsString()
  @Max(1500)
  description: string;

  @IsString()
  @IsUrl()
  image: string;

  @IsArray()
  @IsNotEmpty()
  itemsId: number[];
}
