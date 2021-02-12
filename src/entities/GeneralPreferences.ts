import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, ObjectType, registerEnumType } from 'type-graphql';

import {
  ChatRequestsFrom,
  CommunityContentSort,
  PrivateMessageFrom,
} from '../types';

/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
enum CommunityContentSortEnum {
  HOT = 'Hot',
  RISING = 'Rising',
  NEW = 'New',
  TOP = 'Top',
}

enum ChatRequestsFromEnum {
  EVERYONE = 'Everyone',
  DAYS = '30 days',
  NOBODY = 'Nobody',
}

enum PrivateMessageFromEnum {
  EVERYONE = 'Everyone',
  NOBODY = 'Nobody',
}

registerEnumType(CommunityContentSortEnum, {
  name: 'CommunityContentSort',
});

registerEnumType(ChatRequestsFromEnum, {
  name: 'ChatRequestsFrom',
});

registerEnumType(PrivateMessageFromEnum, {
  name: 'PrivateMessageFrom',
});

@ObjectType()
@Entity('general_preferences')
class GeneralPreferences extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  @Field(() => Boolean)
  autoplayMedia: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  blurNsfw: boolean;

  @Column({ default: 'Everyone' })
  @Field(() => ChatRequestsFromEnum)
  chatRequestsFrom: ChatRequestsFrom;

  @Column({ default: 'Hot' })
  @Field(() => CommunityContentSortEnum)
  communityContentSort: CommunityContentSort;

  @Column({ default: false })
  @Field(() => Boolean)
  markdownIsDefault: boolean;

  @Column({ default: 'Everyone' })
  @Field(() => PrivateMessageFromEnum)
  privateMessageFrom: PrivateMessageFrom;

  @Column({ default: false })
  @Field(() => Boolean)
  openPostInNewTab: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  reduceAnimations: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  rememberPerCommunity: boolean;

  @Column({ default: true })
  @Field(() => Boolean)
  useCommunityThemes: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  viewNsfw: boolean;

  @CreateDateColumn()
  @Field(() => String)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => String)
  updatedAt: Date;
}

export default GeneralPreferences;
