import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import {
  VoiceGender,
  VoiceAge,
  VoiceAccent,
  VoiceStyle,
  SpeakingRate,
  VoiceClarity,
} from './enums';

@Entity('voice_profiles')
@Index(['organizationId'])
export class VoiceProfile extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: VoiceGender, default: VoiceGender.NEUTRAL })
  gender: VoiceGender;

  @Column({ type: 'enum', enum: VoiceAge, default: VoiceAge.ADULT })
  age: VoiceAge;

  @Column({ type: 'enum', enum: VoiceAccent, default: VoiceAccent.EN_US })
  accent: VoiceAccent;

  @Column({ type: 'enum', enum: VoiceStyle, default: VoiceStyle.PROFESSIONAL })
  style: VoiceStyle;

  @Column({ type: 'float', default: 0.5 })
  pitch: number;

  @Column({ type: 'enum', enum: SpeakingRate, default: SpeakingRate.NORMAL })
  speakingRate: SpeakingRate;

  @Column({ type: 'float', default: 0.75 })
  stability: number;

  @Column({ type: 'enum', enum: VoiceClarity, default: VoiceClarity.BALANCED })
  clarity: VoiceClarity;

  @Column({ type: 'float', default: 0.5 })
  speed: number;

  @Column({ type: 'float', default: 0.75 })
  similarity: number;

  @Column({ type: 'jsonb', nullable: true })
  emotions: Array<{
    emotion: string;
    strength: number;
  }> | null;

  @Column({ type: 'float', default: 0.5 })
  expressiveness: number;

  @Column({ type: 'float', default: 0.5 })
  warmth: number;

  @Column({ type: 'float', default: 0.3 })
  breathiness: number;

  @Column({ type: 'float', default: 0.5 })
  pauseLength: number;

  @Column({ type: 'boolean', default: true })
  aiFillers: boolean;

  @Column({ type: 'boolean', default: true })
  interruptibility: boolean;

  @Column({ type: 'enum', enum: VoiceStyle, nullable: true })
  fallbackTone: VoiceStyle | null;

  @Column({ type: 'jsonb', nullable: true })
  pronunciationDictionary: Array<{
    word: string;
    pronunciation: string;
  }> | null;
}
