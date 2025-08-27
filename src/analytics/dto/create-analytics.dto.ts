import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateAnalyticsDto {
  @IsNotEmpty()
  @IsString()
  event_type: string;

  @IsOptional()
  @IsString()
  resource_id?: string;

  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsString()
  session_id?: string;

  @IsOptional()
  @IsString()
  ip_address?: string;

  @IsOptional()
  @IsString()
  user_agent?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}
