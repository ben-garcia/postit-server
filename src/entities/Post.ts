import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType, ID } from 'type-graphql';

import { Community, User } from '.';

@ObjectType()
@Entity('posts')
class Post extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Community)
  @ManyToOne(() => Community, community => community.posts)
  community: Community;

  @Column()
  @Field(() => String)
  contentKind: 'link' | 'self' | 'video' | 'videogif';

  @Field(() => User)
  @ManyToOne(() => User, user => user.posts)
  creator: User;

  @Column()
  @Field(() => Boolean)
  isNsfw: boolean;

  @Column()
  @Field(() => Boolean)
  isOriginalContent: boolean;

  @Column()
  @Field(() => Boolean)
  isSpoiler: boolean;

  @Column('varchar', { nullable: true })
  @Field(() => String, { nullable: true })
  linkUrl: String | null;

  @Column()
  @Field(() => Boolean)
  sendReplies: boolean;

  @Column('varchar', { length: 9 })
  @Field(() => String)
  submitType: 'community' | 'profile';

  @Column('text', { nullable: true })
  @Field(() => String)
  richTextJson: String | null;

  @Column('varchar', { length: 300 })
  @Field(() => String)
  title: string;

  @CreateDateColumn()
  @Field(() => String)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => String)
  updatedAt: Date;
}

export default Post;
