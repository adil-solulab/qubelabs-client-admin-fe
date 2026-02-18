import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { SDKCategory, WidgetPosition } from './enums';

@Entity('embed_widgets')
@Index(['organizationId'])
export class EmbedWidget extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: SDKCategory })
  type: SDKCategory;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'uuid', nullable: true })
  agentId: string | null;

  @Column({ type: 'varchar', length: 100, default: 'Call Us' })
  buttonText: string;

  @Column({ type: 'enum', enum: WidgetPosition, default: WidgetPosition.BOTTOM_RIGHT })
  position: WidgetPosition;

  @Column({ type: 'varchar', length: 50, default: 'rounded' })
  buttonStyle: string;

  @Column({ type: 'varchar', length: 20, default: 'medium' })
  buttonSize: string;

  @Column({ type: 'varchar', length: 7, default: '#2563eb' })
  primaryColor: string;

  @Column({ type: 'boolean', default: true })
  pulseAnimation: boolean;

  @Column({ type: 'varchar', length: 20, default: 'light' })
  theme: string;

  @Column({ type: 'varchar', length: 10, default: '12px' })
  borderRadius: string;

  @Column({ type: 'varchar', length: 50, default: 'DM Sans' })
  font: string;

  @Column({ type: 'boolean', default: true })
  muteButton: boolean;

  @Column({ type: 'boolean', default: true })
  speakerButton: boolean;

  @Column({ type: 'boolean', default: false })
  holdButton: boolean;

  @Column({ type: 'boolean', default: true })
  callDurationDisplay: boolean;

  @Column({ type: 'boolean', default: false })
  networkQualityIndicator: boolean;

  @Column({ type: 'int', default: 30 })
  maxCallDurationMinutes: number;

  @Column({ type: 'simple-array', nullable: true })
  allowedDomains: string[] | null;

  @Column({ type: 'text', nullable: true })
  generatedEmbedCode: string | null;
}
