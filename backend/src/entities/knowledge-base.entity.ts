import {
  Entity,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { KnowledgeSource } from './knowledge-source.entity';

@Entity('knowledge_bases')
@Index(['organizationId'])
export class KnowledgeBase extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  totalDocuments: number;

  @Column({ type: 'bigint', default: 0 })
  totalSizeBytes: number;

  @Column({ type: 'int', default: 0 })
  totalChunks: number;

  @Column({ type: 'varchar', length: 100, default: 'text-embedding-ada-002' })
  embeddingModel: string;

  @Column({ type: 'int', default: 512 })
  chunkSize: number;

  @Column({ type: 'int', default: 50 })
  chunkOverlap: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastSyncAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any> | null;

  @OneToMany(() => KnowledgeSource, (source) => source.knowledgeBase)
  sources: KnowledgeSource[];
}
