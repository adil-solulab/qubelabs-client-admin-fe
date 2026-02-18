import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { Flow } from './flow.entity';

@Entity('flow_edges')
@Index(['flowId'])
export class FlowEdge extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  flowId: string;

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

  @ManyToOne(() => Flow, (flow) => flow.edges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flowId' })
  flow: Flow;
}
