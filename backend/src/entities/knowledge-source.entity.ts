import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { KnowledgeBase } from './knowledge-base.entity';
import { KnowledgeDocument } from './knowledge-document.entity';
import { KnowledgeSourceType, SourceSyncStatus } from './enums';

@Entity('knowledge_sources')
@Index(['knowledgeBaseId'])
@Index(['organizationId'])
export class KnowledgeSource extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  knowledgeBaseId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: KnowledgeSourceType })
  type: KnowledgeSourceType;

  @Column({ type: 'enum', enum: SourceSyncStatus, default: SourceSyncStatus.PENDING })
  syncStatus: SourceSyncStatus;

  @Column({ type: 'jsonb', nullable: true })
  config: {
    url?: string;
    sitemapUrl?: string;
    fileType?: string;
    filePath?: string;
    credentials?: Record<string, string>;
    syncInterval?: number;
    maxPages?: number;
    includePatterns?: string[];
    excludePatterns?: string[];
  } | null;

  @Column({ type: 'boolean', default: false })
  autoSync: boolean;

  @Column({ type: 'int', nullable: true })
  syncIntervalMinutes: number | null;

  @Column({ type: 'int', default: 0 })
  documentCount: number;

  @Column({ type: 'bigint', default: 0 })
  totalSizeBytes: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastSyncAt: Date | null;

  @Column({ type: 'text', nullable: true })
  lastSyncError: string | null;

  @ManyToOne(() => KnowledgeBase, (kb) => kb.sources, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'knowledgeBaseId' })
  knowledgeBase: KnowledgeBase;

  @OneToMany(() => KnowledgeDocument, (doc) => doc.source)
  documents: KnowledgeDocument[];
}
