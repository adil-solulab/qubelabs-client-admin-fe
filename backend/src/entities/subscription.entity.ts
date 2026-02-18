import {
  Entity,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { Invoice } from './invoice.entity';
import { SubscriptionPlan, SubscriptionStatus } from './enums';

@Entity('subscriptions')
@Index(['organizationId'])
@Index(['status'])
export class Subscription extends TenantBaseEntity {
  @Column({ type: 'enum', enum: SubscriptionPlan })
  plan: SubscriptionPlan;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthlyPrice: number;

  @Column({ type: 'boolean', default: true })
  autoRenew: boolean;

  @Column({ type: 'int', default: 0 })
  totalCredits: number;

  @Column({ type: 'int', default: 0 })
  usedCredits: number;

  @Column({ type: 'timestamptz' })
  currentPeriodStart: Date;

  @Column({ type: 'timestamptz' })
  currentPeriodEnd: Date;

  @Column({ type: 'timestamptz', nullable: true })
  trialEndsAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalSubscriptionId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  usageMetrics: {
    apiCalls: number;
    minutesUsed: number;
    storageUsedMb: number;
    agentsCount: number;
    maxAgents: number;
    maxApiCalls: number;
    maxMinutes: number;
    maxStorageMb: number;
  } | null;

  @OneToMany(() => Invoice, (inv) => inv.subscription)
  invoices: Invoice[];
}
