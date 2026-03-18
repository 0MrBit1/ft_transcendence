import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  IsArray,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

enum EventType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

enum LocationType {
  ONLINE = 'ONLINE',
  PHYSICAL = 'PHYSICAL',
}

export class UpdateEventDto {
  @ApiPropertyOptional({ example: 'Updated Event Title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: EventType })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @ApiPropertyOptional({ example: '2026-08-01T18:00:00Z' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ example: '2026-08-01T20:00:00Z' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ enum: LocationType })
  @IsOptional()
  @IsEnum(LocationType)
  locationType?: LocationType;

  @ApiPropertyOptional({ example: 'Room 202' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ example: ['music', 'art'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
