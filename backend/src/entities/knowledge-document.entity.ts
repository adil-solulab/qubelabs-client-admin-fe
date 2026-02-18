import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { KnowledgeSource } from './knowledge-source.entity';

@Entity('knowledge_documents')
@Index(['sourceId'])
@Index(['organizationId'])
export class KnowledgeDocument extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  sourceId: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fileType: string | null;

  @Column({ type: 'bigint', default: 0 })
  sizeBytes: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  sourceUrl: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  contentHash: string | null;

  @Column({ type: 'int', default: 0 })
  chunkCount: number;

  @Column({ type: 'boolean', default: false })
  isProcessed: boolean;

  @Column({ type: 'text', nullable: true })
  processingError: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @ManyToOne(() => KnowledgeSource, (source) => source.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourceId' })
  source: KnowledgeSource;
}
