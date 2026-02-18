import {
  Entity,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { FlowNode } from './flow-node.entity';
import { FlowEdge } from './flow-edge.entity';
import { FlowStatus, EnvironmentType } from './enums';

@Entity('flows')
@Index(['organizationId'])
@Index(['status'])
export class Flow extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: FlowStatus, default: FlowStatus.DRAFT })
  status: FlowStatus;

  @Column({ type: 'enum', enum: EnvironmentType, default: EnvironmentType.STAGING })
  environment: EnvironmentType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'uuid', nullable: true })
  publishedById: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  testConfig: {
    mode: 'chat' | 'voice';
    testInputs?: Record<string, any>;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  variables: Array<{
    name: string;
    type: string;
    defaultValue?: string;
  }> | null;

  @OneToMany(() => FlowNode, (node) => node.flow, { cascade: true })
  nodes: FlowNode[];

  @OneToMany(() => FlowEdge, (edge) => edge.flow, { cascade: true })
  edges: FlowEdge[];
}
