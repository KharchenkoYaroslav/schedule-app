import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { RelatedTeacher, RelatedGroup } from '../dto/admin/curriculum.dto';

@Entity({ name: 'curriculum' })
export class Curriculum {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, name: 'subject_name' })
  subjectName!: string;

  // Array of RelatedTeacher objects (JSON structure)
  @Column('jsonb', { nullable: true, name: 'related_teachers' })
  relatedTeachers: RelatedTeacher[];

  // Array of RelatedGroup objects (JSON structure)
  @Column('jsonb', { nullable: true, name: 'related_groups' })
  relatedGroups: RelatedGroup[];

  @Column({ default: false })
  correspondence: boolean;
}
