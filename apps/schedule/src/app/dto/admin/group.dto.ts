import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';
import { Group } from '../../entities/Group.entity';

// Регулярний вираз для коду групи згідно з регламентом КПІ:
// Формат: [YY]-[S1][XX][S2][S3]
// YY: 2 великі кириличні літери (Префікс)
// S1: опціонально 'зп', 'п', 'з', 'в' (Форма навчання)
// XX: 2 цифри (Рік + Номер групи)
// S2: опціонально 'мп', 'мн', 'ф' (Освітній рівень)
// S3: опціонально 'і' (Контингент)
// Приклади: ІП-31, ША-31мп, ІП-зп21, УЕ-41і
const GROUP_CODE_REGEX = /^[\p{Lu}А-ЯІЄЇҐ]{2}-((зп|[пзв])?\d{2}(мп|мн|ф)?і?)$/u;

export class CreateGroupInput {
  @IsNotEmpty()
  @IsString()
  @Matches(GROUP_CODE_REGEX, {
    message:
      'Group code must match the format: [YY]-[S1][XX][S2][S3] (e.g., ІП-31, ША-31мп, ІП-зп21)',
  })
  groupCode: string;

  @IsNotEmpty()
  @IsString()
  faculty: string;
}


export class UpdateGroupInput {
  @IsOptional()
  @IsString()
  @Matches(GROUP_CODE_REGEX, {
    message:
      'Group code must match the format: [YY]-[S1][XX][S2][S3] (e.g., ІП-31, ША-31мп, ІП-зп21)',
  })
  groupCode?: string;

  @IsOptional()
  @IsString()
  faculty?: string;
}

export class FindAllGroupsResponse {
  groups: Group[];
}
