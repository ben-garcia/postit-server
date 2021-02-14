import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, Int, ObjectType } from 'type-graphql';

@ObjectType()
@Entity('profile')
class Profile extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200, nullable: true })
  @Field(() => String, { nullable: true })
  about: string;

  @Column({ default: true })
  @Field(() => Boolean)
  activityVisibility: boolean;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  avatarUrl: string;

  @Column({ default: 0 })
  @Field(() => Int)
  awardeeKarma: number;

  @Column({ default: 0 })
  @Field(() => Int)
  awarderKarma: number;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  bannerUrl: string;

  @Column({ default: true })
  @Field(() => Boolean)
  canCreateCommunitites: boolean;

  @Column({ default: 0 })
  @Field(() => Int)
  coinCount: number;

  @Column({ default: true })
  @Field(() => Boolean)
  contentVisibility: boolean;

  @Column({ default: 0 })
  @Field(() => Int)
  commentKarma: number;

  @Column({ length: 30, nullable: true })
  @Field(() => String, { nullable: true })
  displayName: string;

  @Column({ default: false })
  @Field(() => Boolean)
  hasNightmode: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  hasPaypalSubscription: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  hasPremium: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  hasStripeSubscription: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  hasUnreadMail: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  hasUnreadModmail: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  hasVerifiedEmail: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  isModerator: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  isSuspended: boolean;

  @Column({ default: 0 })
  @Field(() => Int)
  postKarma: number;

  @Column({ default: false })
  @Field(() => Boolean)
  showNsfw: boolean;
}

export default Profile;
