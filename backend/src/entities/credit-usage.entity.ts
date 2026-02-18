import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { User } from './user.entity';

export enum UsageType {
  API_CALL = 'api_call',
  VOICE_MINUTE = 'voice_minute',
  CHAT_SESSION = 'chat_session',
  KNOWLEDGE_SYNC = 'knowledge_sync',
  CAMPAIGN_CALL = 'campaign_call',
  LLM_TOKEN = 'llm_token',
  STORAGE = 'storage',
}

@Entity('credit_usage')
@Index(['organizationId'])
@Index(['usageType'])
@Index(['createdAt'])
export class CreditUsage extends TenantBaseEntity {
  @Column({ type: 'enum', enum: UsageType })
  usageType: UsageType;

  @Column({ type: 'int' })
  creditsUsed: number;

  @Column({ type: 'int' })
  creditsRemaining: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', nullable: true })
  referenceId: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceType: string | null;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User | null;
}
