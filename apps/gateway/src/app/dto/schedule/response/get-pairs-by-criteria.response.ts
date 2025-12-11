import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PairMinimalInfo } from '../type/pair-minimal-info.type';

export class GetPairsByCriteriaResponse {
  @ApiProperty({ description: 'List of pairs matching the criteria', type: [PairMinimalInfo] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PairMinimalInfo)
  pairs: PairMinimalInfo[];
}
