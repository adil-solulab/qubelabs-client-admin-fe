import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { User } from './user.entity';

export enum ApiKeyType {
  PUBLISHABLE = 'publishable',
  SECRET = 'secret',
}

@Entity('api_keys')
@Index(['organizationId'])
@Index(['keyPrefix'])
export class ApiKey extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: ApiKeyType })
  type: ApiKeyType;

  @Column({ type: 'varchar', length: 20 })
  keyPrefix: string;

  @Column({ type: 'varchar', length: 255, select: false })
  keyHash: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  maskedKey: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'simple-array', nullable: true })
  permissions: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  allowedDomains: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  allowedIps: string[] | null;

  @Column({ type: 'int', nullable: true })
  rateLimit: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastUsedAt: Date | null;

  @Column({ type: 'bigint', default: 0 })
  usageCount: number;

  @Column({ type: 'uuid', nullable: true })
  createdById: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User | null;
}
