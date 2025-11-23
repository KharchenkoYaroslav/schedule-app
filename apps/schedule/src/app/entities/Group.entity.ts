import { Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity({ name: 'groups' })
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'group_code', unique: true })
  groupCode!: string;

  @Column()
  faculty!: string;
}
