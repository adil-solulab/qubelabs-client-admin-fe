import {
  Entity,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { WorkflowNode } from './workflow-node.entity';
import { WorkflowEdge } from './workflow-edge.entity';
import { FlowStatus, EnvironmentType } from './enums';

@Entity('workflows')
@Index(['organizationId'])
@Index(['status'])
export class Workflow extends TenantBaseEntity {
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
  outputVariables: Array<{
    name: string;
    type: string;
    description?: string;
  }> | null;

  @Column({ type: 'jsonb', nullable: true })
  inputVariables: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultValue?: string;
  }> | null;

  @OneToMany(() => WorkflowNode, (node) => node.workflow, { cascade: true })
  nodes: WorkflowNode[];

  @OneToMany(() => WorkflowEdge, (edge) => edge.workflow, { cascade: true })
  edges: WorkflowEdge[];
}
