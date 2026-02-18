import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { SSOProvider } from './enums';

@Entity('sso_configs')
@Index(['organizationId'])
@Index(['provider'])
export class SSOConfig extends TenantBaseEntity {
  @Column({ type: 'enum', enum: SSOProvider })
  provider: SSOProvider;

  @Column({ type: 'varchar', length: 255 })
  displayName: string;

  @Column({ type: 'boolean', default: false })
  isEnabled: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  entityId: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ssoUrl: string | null;

  @Column({ type: 'text', nullable: true })
  certificate: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  metadataUrl: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  clientId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  clientSecret: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  issuerUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  callbackUrl: string | null;

  @Column({ type: 'simple-array', nullable: true })
  allowedDomains: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  attributeMapping: {
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    groups?: string;
  } | null;

  @Column({ type: 'boolean', default: false })
  autoProvision: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastTestedAt: Date | null;

  @Column({ type: 'boolean', nullable: true })
  lastTestResult: boolean | null;
}
