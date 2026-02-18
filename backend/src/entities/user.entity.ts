import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { Organization } from './organization.entity';
import { UserRole, UserStatus, AgentStatus } from './enums';

@Entity('users')
@Index(['organizationId', 'email'], { unique: true })
export class User extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.AGENT })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ type: 'enum', enum: AgentStatus, default: AgentStatus.OFFLINE })
  agentStatus: AgentStatus;

  @Column({ type: 'int', default: 1 })
  maxConcurrentChats: number;

  @Column({ type: 'boolean', default: false })
  isMfaEnabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  mfaSecret: string | null;

  @Column({ type: 'jsonb', nullable: true })
  securityQuestions: Array<{
    question: string;
    answerHash: string;
  }> | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  timezone: string | null;

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any> | null;

  @ManyToOne(() => Organization, (org) => org.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;
}
