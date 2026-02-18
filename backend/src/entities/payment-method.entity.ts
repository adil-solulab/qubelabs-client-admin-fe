import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';

@Entity('payment_methods')
@Index(['organizationId'])
export class PaymentMethod extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'varchar', length: 4, nullable: true })
  lastFourDigits: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  brand: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  expiryMonth: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  expiryYear: string | null;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalPaymentMethodId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  billingName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  billingEmail: string | null;
}
