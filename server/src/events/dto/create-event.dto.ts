import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: ['match', 'training', 'tournament', 'meeting'] })
  @IsEnum(['match', 'training', 'tournament', 'meeting'])
  type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  location: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(0)
  scoreGreen: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(0)
  scoreOrange: number;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  scorersGreen: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  scorersOrange: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  assistsGreen: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  assistsOrange: string[];
}
