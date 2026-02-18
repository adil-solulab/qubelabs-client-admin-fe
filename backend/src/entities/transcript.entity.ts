import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { TranscriptEntry } from './transcript-entry.entity';
import { Conversation } from './conversation.entity';
import { Agent } from './agent.entity';
import { ChannelType, SentimentType } from './enums';

@Entity('transcripts')
@Index(['organizationId'])
@Index(['conversationId'])
@Index(['channelType'])
export class Transcript extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  conversationId: string;

  @Column({ type: 'enum', enum: ChannelType })
  channelType: ChannelType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  agentName: string | null;

  @Column({ type: 'uuid', nullable: true })
  agentId: string | null;

  @Column({ type: 'int', default: 0 })
  durationSeconds: number;

  @Column({ type: 'enum', enum: SentimentType, nullable: true })
  overallSentiment: SentimentType | null;

  @Column({ type: 'float', nullable: true })
  sentimentScore: number | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  recordingUrl: string | null;

  @Column({ type: 'bigint', nullable: true })
  recordingSizeBytes: number | null;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    callId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
  } | null;

  @Column({ type: 'boolean', default: false })
  isExported: boolean;

  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @ManyToOne(() => Agent, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'agentId' })
  agent: Agent | null;

  @OneToMany(() => TranscriptEntry, (entry) => entry.transcript, { cascade: true })
  entries: TranscriptEntry[];
}
