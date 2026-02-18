import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { MetricCategory, PeriodType } from './enums';

@Entity('analytics_metrics')
@Index(['organizationId'])
@Index(['metricName'])
@Index(['periodStart', 'periodEnd'])
export class AnalyticsMetric extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  metricName: string;

  @Column({ type: 'enum', enum: MetricCategory })
  metricCategory: MetricCategory;

  @Column({ type: 'float' })
  value: number;

  @Column({ type: 'float', nullable: true })
  previousValue: number | null;

  @Column({ type: 'float', nullable: true })
  changePercentage: number | null;

  @Column({ type: 'enum', enum: PeriodType })
  periodType: PeriodType;

  @Column({ type: 'timestamptz' })
  periodStart: Date;

  @Column({ type: 'timestamptz' })
  periodEnd: Date;

  @Column({ type: 'jsonb', nullable: true })
  breakdown: Record<string, number> | null;

  @Column({ type: 'jsonb', nullable: true })
  sparklineData: number[] | null;
}
