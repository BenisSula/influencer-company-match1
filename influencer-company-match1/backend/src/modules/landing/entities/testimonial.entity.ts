import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('testimonials')
export class Testimonial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  authorName: string;

  @Column({ length: 100, nullable: true })
  authorRole: string;

  @Column({ length: 255, nullable: true })
  authorAvatar: string;

  @Column('text')
  content: string;

  @Column({ default: 5 })
  rating: number;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
