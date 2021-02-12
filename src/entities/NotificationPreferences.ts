import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
@Entity('notification_preferences')
class NotificationPreferences extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  @Field(() => Boolean)
  announcements: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  awardsReceived: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  cakeDay: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  chatMessages: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  chatsPostsActivity: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  chatRequests: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  commentReplies: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  commentsActivity: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  commentsOnPosts: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  inboxMessages: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  modNotifications: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  newFollowers: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  newPostFlair: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  newUserFlair: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  pinnedPosts: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  threadsActivity: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  upvotesOnComments: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  upvotesOnPosts: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  usernameMentions: boolean;
}

export default NotificationPreferences;
