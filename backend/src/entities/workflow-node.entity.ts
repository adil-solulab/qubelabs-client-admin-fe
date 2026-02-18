import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { Workflow } from './workflow.entity';
import { WorkflowNodeType } from './enums';

@Entity('workflow_nodes')
@Index(['workflowId'])
export class WorkflowNode extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  workflowId: string;

  @Column({ type: 'enum', enum: WorkflowNodeType })
  type: WorkflowNodeType;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'float' })
  positionX: number;

  @Column({ type: 'float' })
  positionY: number;

  @Column({ type: 'jsonb', nullable: true })
  data: {
    actionType?: string;
    integrationId?: string;
    integrationAction?: string;
    conditions?: Array<{
      field: string;
      operator: string;
      value: string;
    }>;
    messageTemplate?: string;
    messageChannel?: string;
    ticketConfig?: Record<string, any>;
    crmAction?: string;
    crmMapping?: Record<string, string>;
    safetyConfig?: Record<string, any>;
    retryConfig?: {
      maxRetries: number;
      retryDelay: number;
    };
    timeoutSeconds?: number;
  } | null;

  @ManyToOne(() => Workflow, (wf) => wf.nodes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflowId' })
  workflow: Workflow;
}
