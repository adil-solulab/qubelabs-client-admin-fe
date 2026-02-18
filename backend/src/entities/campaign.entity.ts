import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { CampaignLead } from './campaign-lead.entity';
import { Agent } from './agent.entity';
import { Flow } from './flow.entity';
import { Workflow } from './workflow.entity';
import { User } from './user.entity';
import { CampaignType, CampaignStatus } from './enums';

@Entity('campaigns')
@Index(['organizationId'])
@Index(['status'])
export class Campaign extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: CampaignType })
  type: CampaignType;

  @Column({ type: 'enum', enum: CampaignStatus, default: CampaignStatus.DRAFT })
  status: CampaignStatus;

  @Column({ type: 'uuid', nullable: true })
  agentId: string | null;

  @Column({ type: 'uuid', nullable: true })
  flowId: string | null;

  @Column({ type: 'uuid', nullable: true })
  workflowId: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  leadSource: string | null;

  @Column({ type: 'int', default: 0 })
  totalLeads: number;

  @Column({ type: 'int', default: 0 })
  completedLeads: number;

  @Column({ type: 'int', default: 0 })
  failedLeads: number;

  @Column({ type: 'timestamptz', nullable: true })
  scheduledAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  createdById: string | null;

  @Column({ type: 'jsonb', nullable: true })
  schedule: {
    timezone: string;
    days: string[];
    startTime: string;
    endTime: string;
    maxConcurrentCalls: number;
    retryAttempts: number;
    retryDelayMinutes: number;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  voiceSettings: {
    voiceProfileId?: string;
    maxCallDuration?: number;
    voicemailDetection?: boolean;
    leaveVoicemail?: boolean;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  columnMapping: Record<string, string> | null;

  @Column({ type: 'jsonb', nullable: true })
  stats: {
    answered: number;
    noAnswer: number;
    busy: number;
    voicemail: number;
    failed: number;
    avgDuration: number;
    successRate: number;
  } | null;

  @ManyToOne(() => Agent, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'agentId' })
  agent: Agent | null;

  @ManyToOne(() => Flow, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'flowId' })
  flow: Flow | null;

  @ManyToOne(() => Workflow, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'workflowId' })
  workflow: Workflow | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User | null;

  @OneToMany(() => CampaignLead, (lead) => lead.campaign)
  leads: CampaignLead[];
}
