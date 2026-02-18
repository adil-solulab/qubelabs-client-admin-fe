import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';

@Entity('chat_widget_configs')
@Index(['organizationId'])
export class ChatWidgetConfig extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255, default: 'Chat with us' })
  title: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  subtitle: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  welcomeMessage: string | null;

  @Column({ type: 'varchar', length: 7, default: '#2563eb' })
  primaryColor: string;

  @Column({ type: 'varchar', length: 50, default: 'bottom-right' })
  position: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  botIconUrl: string | null;

  @Column({ type: 'boolean', default: true })
  showBranding: boolean;

  @Column({ type: 'boolean', default: true })
  soundEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  autoOpen: boolean;

  @Column({ type: 'int', nullable: true })
  autoOpenDelaySeconds: number | null;

  @Column({ type: 'boolean', default: true })
  showTypingIndicator: boolean;

  @Column({ type: 'boolean', default: true })
  fileUploadEnabled: boolean;

  @Column({ type: 'boolean', default: true })
  emojiEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  navigation: Array<{
    label: string;
    url: string;
    icon?: string;
  }> | null;

  @Column({ type: 'simple-array', nullable: true })
  allowedDomains: string[] | null;

  @Column({ type: 'uuid', nullable: true })
  agentId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  customCss: Record<string, string> | null;

  @Column({ type: 'varchar', length: 50, default: 'rounded' })
  borderRadius: string;

  @Column({ type: 'varchar', length: 50, default: 'DM Sans' })
  font: string;

  @Column({ type: 'varchar', length: 20, default: 'light' })
  theme: string;
}
