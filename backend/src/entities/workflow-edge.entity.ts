import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { Workflow } from './workflow.entity';

@Entity('workflow_edges')
@Index(['workflowId'])
export class WorkflowEdge extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  workflowId: string;

  @Column({ type: 'uuid' })
  sourceNodeId: string;

  @Column({ type: 'uuid' })
  targetNodeId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sourceHandle: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  targetHandle: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  label: string | null;

  @Column({ type: 'jsonb', nullable: true })
  condition: {
    field?: string;
    operator?: string;
    value?: string;
  } | null;

  @ManyToOne(() => Workflow, (wf) => wf.edges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflowId' })
  workflow: Workflow;
}
