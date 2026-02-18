import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { Flow } from './flow.entity';
import { FlowNodeType } from './enums';

@Entity('flow_nodes')
@Index(['flowId'])
export class FlowNode extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  flowId: string;

  @Column({ type: 'enum', enum: FlowNodeType })
  type: FlowNodeType;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'float' })
  positionX: number;

  @Column({ type: 'float' })
  positionY: number;

  @Column({ type: 'jsonb', nullable: true })
  data: {
    content?: string;
    prompt?: string;
    conditions?: Array<{
      field: string;
      operator: string;
      value: string;
    }>;
    actionType?: string;
    workflowId?: string;
    safetyConfig?: {
      botType?: string;
      sentimentAnalysis?: boolean;
      piiDetection?: boolean;
      policyViolation?: boolean;
      profanityFilter?: boolean;
      topicGuardrails?: string[];
      customRules?: Array<{
        name: string;
        pattern: string;
        action: string;
      }>;
      riskAction?: string;
      auditLogging?: boolean;
    };
    outputVariables?: Array<{
      name: string;
      type: string;
    }>;
  } | null;

  @ManyToOne(() => Flow, (flow) => flow.nodes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flowId' })
  flow: Flow;
}
