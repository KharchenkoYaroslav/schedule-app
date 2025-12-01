import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PairMinimalInfo } from './pair-minimal-info.type';

export class GetPairsByCriteriaResponse {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PairMinimalInfo)
  pairs?: PairMinimalInfo[];
}
