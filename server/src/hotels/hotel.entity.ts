import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Room } from './room.entity';

export enum HotelType {
  DOMESTIC = 'domestic',
  OVERSEAS = 'overseas',
  HOMESTAY = 'homestay'
}

export enum HotelStatus {
  PENDING = 'pending',
  PUBLISHED = 'published',
  OFFLINE = 'offline',
  REJECTED = 'rejected'
}

@Entity()
export class Hotel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column('double', { nullable: true })
  latitude: number;

  @Column('double', { nullable: true })
  longitude: number;

  @Column()
  starRating: number;

  @Column({ nullable: true })
  openingDate: Date;

  @Column('simple-array', { nullable: true })
  facilities: string[];

  @Column('text', { nullable: true })
  description: string;

  @Column('longtext', { nullable: true })
  storeImg: string;

  @Column('simple-json', { nullable: true })
  images: string[];

  @Column({
    type: 'enum',
    enum: HotelType,
    default: HotelType.DOMESTIC
  })
  type: HotelType;

  @Column({
    type: 'enum',
    enum: HotelStatus,
    default: HotelStatus.PENDING
  })
  status: HotelStatus;

  @Column({ nullable: true })
  auditReason: string;

  @ManyToOne(() => User)
  merchant: User;

  @OneToMany(() => Room, room => room.hotel, { cascade: true })
  rooms: Room[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
