import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { IntegrationCategory, IntegrationStatus, AuthType } from './enums';

@Entity('integrations')
@Index(['organizationId'])
@Index(['category'])
@Index(['status'])
export class Integration extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: IntegrationCategory })
  category: IntegrationCategory;

  @Column({ type: 'varchar', length: 100 })
  provider: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon: string | null;

  @Column({ type: 'enum', enum: IntegrationStatus, default: IntegrationStatus.DISCONNECTED })
  status: IntegrationStatus;

  @Column({ type: 'enum', enum: AuthType })
  authType: AuthType;

  @Column({ type: 'jsonb', nullable: true })
  credentials: Record<string, string> | null;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any> | null;

  @Column({ type: 'simple-array', nullable: true })
  features: string[] | null;

  @Column({ type: 'timestamptz', nullable: true })
  connectedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastSyncAt: Date | null;

  @Column({ type: 'text', nullable: true })
  lastError: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  webhookUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  docsUrl: string | null;
}
