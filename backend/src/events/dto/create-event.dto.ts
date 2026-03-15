import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  IsArray,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum EventType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

enum LocationType {
  ONLINE = 'ONLINE',
  PHYSICAL = 'PHYSICAL',
}

export class CreateEventDto {
  @ApiProperty({ example: 'Tech Meetup 2026' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'A meetup for tech enthusiasts' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: EventType, example: 'PUBLIC' })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({ example: '2026-04-15T18:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiPropertyOptional({ example: '2026-04-15T20:00:00Z' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiProperty({ enum: LocationType, example: 'PHYSICAL' })
  @IsEnum(LocationType)
  locationType: LocationType;

  @ApiPropertyOptional({ example: 'Room 101, Main Building' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 100, description: 'Max attendees. Omit for unlimited.' })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  organizationId: string;

  @ApiPropertyOptional({ example: ['tech', 'networking'], description: 'Tags for the event' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
