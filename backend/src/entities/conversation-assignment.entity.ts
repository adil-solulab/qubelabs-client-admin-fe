import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { User } from './user.entity';
import { Conversation } from './conversation.entity';
import { AssignmentType } from './enums';

@Entity('conversation_assignments')
@Index(['conversationId'])
@Index(['agentId'])
@Index(['organizationId'])
export class ConversationAssignment extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  conversationId: string;

  @Column({ type: 'uuid' })
  agentId: string;

  @Column({ type: 'enum', enum: AssignmentType })
  assignmentType: AssignmentType;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  acceptedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  endedAt: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  endReason: string | null;

  @Column({ type: 'jsonb', nullable: true })
  supervisorActions: Array<{
    action: string;
    timestamp: Date;
    supervisorId: string;
  }> | null;

  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agentId' })
  agent: User;
}
