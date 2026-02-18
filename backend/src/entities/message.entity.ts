import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { Conversation } from './conversation.entity';
import { MessageSender, MessageType, SentimentType } from './enums';

@Entity('messages')
@Index(['conversationId'])
@Index(['organizationId'])
@Index(['senderType'])
export class Message extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  conversationId: string;

  @Column({ type: 'enum', enum: MessageSender })
  senderType: MessageSender;

  @Column({ type: 'uuid', nullable: true })
  senderId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  senderName: string | null;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  messageType: MessageType;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: SentimentType, nullable: true })
  sentiment: SentimentType | null;

  @Column({ type: 'float', nullable: true })
  confidenceScore: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  intent: string | null;

  @Column({ type: 'boolean', default: false })
  isWhisper: boolean;

  @Column({ type: 'jsonb', nullable: true })
  attachments: Array<{
    name: string;
    url: string;
    type: string;
    sizeBytes: number;
  }> | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @ManyToOne(() => Conversation, (conv) => conv.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;
}
