import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { Agent } from './agent.entity';

@Entity('super_agents')
@Index(['organizationId'])
export class SuperAgent extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  systemPrompt: string | null;

  @Column({ type: 'varchar', length: 100, default: 'gpt-4' })
  llmModel: string;

  @Column({ type: 'float', default: 0.7 })
  temperature: number;

  @Column({ type: 'int', default: 2048 })
  maxTokens: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  routingRules: Array<{
    intentPattern: string;
    targetAgentId: string;
    priority: number;
    conditions?: Record<string, any>;
  }> | null;

  @Column({ type: 'jsonb', nullable: true })
  fallbackConfig: {
    fallbackAgentId?: string;
    fallbackMessage?: string;
    maxRetries?: number;
  } | null;

  @OneToMany(() => Agent, (agent) => agent.superAgent)
  agents: Agent[];
}
