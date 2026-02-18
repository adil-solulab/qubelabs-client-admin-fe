import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { SuperAgent } from './super-agent.entity';
import { VoiceProfile } from './voice-profile.entity';
import { ChannelType } from './enums';

@Entity('agents')
@Index(['organizationId'])
@Index(['superAgentId'])
export class Agent extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', nullable: true })
  superAgentId: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 100, default: 'gpt-4' })
  llmModel: string;

  @Column({ type: 'float', default: 0.7 })
  temperature: number;

  @Column({ type: 'int', default: 2048 })
  maxTokens: number;

  @Column({ type: 'text', nullable: true })
  persona: string | null;

  @Column({ type: 'jsonb', nullable: true })
  intentConfig: {
    intents: Array<{
      name: string;
      description: string;
      examples: string[];
      priority: number;
    }>;
    confidenceThreshold: number;
  } | null;

  @Column({ type: 'text', nullable: true })
  promptLogic: string | null;

  @Column({ type: 'jsonb', nullable: true })
  routingConfig: {
    rules: Array<{
      condition: string;
      action: string;
      target: string;
    }>;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  guardrails: {
    maxResponseLength?: number;
    blockedTopics?: string[];
    requiredDisclosures?: string[];
    piiHandling?: string;
    sentimentEscalationThreshold?: number;
  } | null;

  @Column({ type: 'simple-array', nullable: true })
  supportedChannels: ChannelType[] | null;

  @Column({ type: 'uuid', nullable: true })
  voiceProfileId: string | null;

  @Column({ type: 'uuid', nullable: true })
  flowId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  callSettings: {
    maxCallDuration: number;
    inactivityDuration: number;
    timezone: string;
    noiseFiltering: boolean;
    voicemailDetection: boolean;
    leaveVoicemailMessage: boolean;
    retryCall: boolean;
    silenceCalleeDuringIntro: boolean;
    silenceCalleeWhenSpeaking: boolean;
    enableBackgroundAudio: boolean;
    enableGracefulExitWarning: boolean;
  } | null;

  @Column({ type: 'simple-array', nullable: true })
  knowledgeBaseIds: string[] | null;

  @ManyToOne(() => SuperAgent, (sa) => sa.agents, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'superAgentId' })
  superAgent: SuperAgent | null;

  @OneToOne(() => VoiceProfile, { nullable: true, cascade: true })
  @JoinColumn({ name: 'voiceProfileId' })
  voiceProfile: VoiceProfile | null;
}
