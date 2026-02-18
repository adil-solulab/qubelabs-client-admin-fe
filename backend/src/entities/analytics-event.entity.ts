import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { ChannelType } from './enums';

@Entity('analytics_events')
@Index(['organizationId'])
@Index(['eventType'])
@Index(['channelType'])
@Index(['createdAt'])
export class AnalyticsEvent extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  eventType: string;

  @Column({ type: 'enum', enum: ChannelType, nullable: true })
  channelType: ChannelType | null;

  @Column({ type: 'uuid', nullable: true })
  conversationId: string | null;

  @Column({ type: 'uuid', nullable: true })
  agentId: string | null;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'uuid', nullable: true })
  campaignId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  properties: Record<string, any> | null;

  @Column({ type: 'float', nullable: true })
  numericValue: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  stringValue: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sessionId: string | null;
}
