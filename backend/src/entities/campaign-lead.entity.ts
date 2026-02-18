import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { Campaign } from './campaign.entity';
import { LeadStatus } from './enums';

@Entity('campaign_leads')
@Index(['campaignId'])
@Index(['status'])
@Index(['organizationId'])
export class CampaignLead extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  campaignId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company: string | null;

  @Column({ type: 'enum', enum: LeadStatus, default: LeadStatus.PENDING })
  status: LeadStatus;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'int', default: 0 })
  callDurationSeconds: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastAttemptAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  conversationId: string | null;

  @Column({ type: 'text', nullable: true })
  disposition: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any> | null;

  @Column({ type: 'text', nullable: true })
  failureReason: string | null;

  @ManyToOne(() => Campaign, (campaign) => campaign.leads, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign;
}
