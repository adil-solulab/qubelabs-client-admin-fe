import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { Transcript } from './transcript.entity';
import { MessageSender, SentimentType } from './enums';

@Entity('transcript_entries')
@Index(['transcriptId'])
export class TranscriptEntry extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  transcriptId: string;

  @Column({ type: 'enum', enum: MessageSender })
  speaker: MessageSender;

  @Column({ type: 'varchar', length: 255, nullable: true })
  speakerName: string | null;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'float' })
  timestampSeconds: number;

  @Column({ type: 'float', nullable: true })
  durationSeconds: number | null;

  @Column({ type: 'float', nullable: true })
  confidence: number | null;

  @Column({ type: 'enum', enum: SentimentType, nullable: true })
  sentiment: SentimentType | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  intent: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @ManyToOne(() => Transcript, (t) => t.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transcriptId' })
  transcript: Transcript;
}
