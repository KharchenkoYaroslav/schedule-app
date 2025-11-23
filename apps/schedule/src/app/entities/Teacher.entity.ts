import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TeacherPost } from '../types/TeacherPost.enum';

@Entity({ name: 'teachers' })
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'full_name' })
  fullName!: string;

  @Column()
  department!: string;

  @Column({
    type: 'enum',
    enum: TeacherPost,
    default: TeacherPost.UNKNOWN,
  })
  post!: TeacherPost;
}
