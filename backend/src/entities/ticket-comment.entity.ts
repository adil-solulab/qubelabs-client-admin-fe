import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { ReportTicket } from './report-ticket.entity';
import { User } from './user.entity';

@Entity('ticket_comments')
@Index(['ticketId'])
export class TicketComment extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  ticketId: string;

  @Column({ type: 'uuid' })
  authorId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  isInternal: boolean;

  @Column({ type: 'jsonb', nullable: true })
  attachments: Array<{
    name: string;
    url: string;
    type: string;
    sizeBytes: number;
  }> | null;

  @ManyToOne(() => ReportTicket, (ticket) => ticket.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticketId' })
  ticket: ReportTicket;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;
}
