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

  @Field(() => String)
  contentType: 'community' | 'profile';

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

  @Column('varchar')
  @Field(() => String)
  name: string;

  @Column()
  @Field(() => Boolean)
  sendReplies: boolean;

  @Column('text')
  @Field(() => String)
  richTextJson: String;

  @Column('varchar', { length: 300 })
  @Field(() => String)
  title: string;

  @Column()
  @Field(() => String)
  url: String;

  @CreateDateColumn()
  @Field(() => String)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => String)
  updatedAt: Date;
}

export default Post;
