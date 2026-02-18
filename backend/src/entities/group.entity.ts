import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('groups')
@Index(['organizationId', 'name'], { unique: true })
export class Group extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', nullable: true })
  supervisorId: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  autoAssignment: boolean;

  @Column({ type: 'jsonb', nullable: true })
  workingHours: {
    timezone: string;
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
      enabled: boolean;
    }>;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any> | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'supervisorId' })
  supervisor: User | null;

  @OneToMany(() => GroupMember, (member) => member.group)
  members: GroupMember[];
}

@Entity('group_members')
@Index(['groupId', 'userId'], { unique: true })
export class GroupMember extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  groupId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;

  @ManyToOne(() => Group, (group) => group.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
