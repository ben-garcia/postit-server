import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
@Entity('email_notification_preferences')
class EmailNotificationPreferences extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  @Field(() => Boolean)
  inboxMessages: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  chatRequests: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  commentReplies: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  commentUpvotes: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  newFollowers: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  postComments: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  postUpvotes: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  usernameMentions: boolean;
}

export default EmailNotificationPreferences;
