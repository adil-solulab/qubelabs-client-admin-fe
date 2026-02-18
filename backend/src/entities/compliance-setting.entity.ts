import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';

@Entity('compliance_settings')
@Index(['organizationId'])
export class ComplianceSetting extends TenantBaseEntity {
  @Column({ type: 'boolean', default: true })
  piiProtectionEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  zeroRetentionMode: boolean;

  @Column({ type: 'boolean', default: true })
  consentRequired: boolean;

  @Column({ type: 'boolean', default: true })
  gdprCompliant: boolean;

  @Column({ type: 'boolean', default: true })
  dataMaskingEnabled: boolean;

  @Column({ type: 'int', default: 365 })
  conversationRetentionDays: number;

  @Column({ type: 'int', default: 365 })
  logRetentionDays: number;

  @Column({ type: 'int', default: 730 })
  backupRetentionDays: number;

  @Column({ type: 'boolean', default: false })
  mfaRequired: boolean;

  @Column({ type: 'jsonb', nullable: true })
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAgeDays: number;
    historyCount: number;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  sessionPolicy: {
    maxSessionDuration: number;
    idleTimeout: number;
    maxConcurrentSessions: number;
    singleSessionEnforced: boolean;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  ipRestrictions: {
    enabled: boolean;
    allowedIps: string[];
    allowedRanges: string[];
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  contentModeration: {
    enabled: boolean;
    rules: Array<{
      name: string;
      pattern: string;
      action: string;
      severity: string;
    }>;
  } | null;
}
