import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType, ID, Int } from 'type-graphql';

import { User } from '.';

@ObjectType()
@Entity('communities')
class Community extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: null, nullable: true })
  @Field(() => String, { nullable: true })
  bannerUrl?: string;

  @Column({ default: 0 })
  @Field(() => Int)
  coinCount: number;

  @Field(() => User)
  @ManyToOne(() => User, user => user.communities)
  creator: User;

  @Column()
  @Field(() => String)
  description: string;

  @Column({ default: null, nullable: true })
  @Field(() => String, { nullable: true })
  iconUrl?: string;

  @Column({ default: false })
  @Field(() => String)
  isNsfw: boolean;

  @Column({ default: null, nullable: true })
  @Field(() => String, { nullable: true })
  location?: string;

  @Column({ length: 21, unique: true })
  @Field(() => String)
  name: string;

  @Column({ default: null, nullable: true })
  @Field(() => String, { nullable: true })
  themeColor?: string;

  @Column('text', { default: null, nullable: true })
  @Field(() => String, { nullable: true })
  topics?: string;

  @Column('varchar', { length: 10 })
  @Field(() => String)
  type: 'private' | 'protected' | 'public';

  @CreateDateColumn()
  @Field(() => String)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => String)
  updatedAt: Date;
}

export default Community;
