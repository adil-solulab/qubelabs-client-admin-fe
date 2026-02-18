import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { Message } from './message.entity';
import { Agent } from './agent.entity';
import { User } from './user.entity';
import { Flow } from './flow.entity';
import { Campaign } from './campaign.entity';
import { ChannelType, ConversationStatus, SentimentType } from './enums';

@Entity('conversations')
@Index(['organizationId'])
@Index(['status'])
@Index(['channelType'])
@Index(['assignedAgentId'])
@Index(['assignedHumanAgentId'])
export class Conversation extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  conversationRef: string;

  @Column({ type: 'enum', enum: ChannelType })
  channelType: ChannelType;

  @Column({ type: 'enum', enum: ConversationStatus, default: ConversationStatus.ACTIVE })
  status: ConversationStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerEmail: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  customerPhone: string | null;

  @Column({ type: 'uuid', nullable: true })
  customerId: string | null;

  @Column({ type: 'uuid', nullable: true })
  assignedAgentId: string | null;

  @Column({ type: 'uuid', nullable: true })
  assignedHumanAgentId: string | null;

  @Column({ type: 'uuid', nullable: true })
  flowId: string | null;

  @Column({ type: 'uuid', nullable: true })
  campaignId: string | null;

  @Column({ type: 'enum', enum: SentimentType, nullable: true })
  sentiment: SentimentType | null;

  @Column({ type: 'float', nullable: true })
  sentimentScore: number | null;

  @Column({ type: 'int', default: 0 })
  messageCount: number;

  @Column({ type: 'int', default: 0 })
  durationSeconds: number;

  @Column({ type: 'timestamptz', nullable: true })
  firstResponseAt: Date | null;

  @Column({ type: 'int', nullable: true })
  slaBreachMinutes: number | null;

  @Column({ type: 'boolean', default: false })
  isSlaBreach: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  disposition: string | null;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @ManyToOne(() => Agent, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignedAgentId' })
  assignedAgent: Agent | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignedHumanAgentId' })
  assignedHumanAgent: User | null;

  @ManyToOne(() => Flow, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'flowId' })
  flow: Flow | null;

  @ManyToOne(() => Campaign, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign | null;

  @OneToMany(() => Message, (msg) => msg.conversation, { cascade: true })
  messages: Message[];
}
