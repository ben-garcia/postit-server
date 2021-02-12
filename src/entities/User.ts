import bcrypt from 'bcrypt';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType, ID } from 'type-graphql';

import {
  GeneralPreferences,
  NotificationPreferences,
  EmailNotificationPreferences,
  Profile,
} from '.';

@ObjectType()
@Entity('users')
class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field(() => String)
  email: string;

  @Field(() => EmailNotificationPreferences, { nullable: true })
  @OneToOne(() => EmailNotificationPreferences)
  @JoinColumn()
  emailNotificationPreferences: EmailNotificationPreferences;

  @Field(() => GeneralPreferences, { nullable: true })
  @OneToOne(() => GeneralPreferences)
  @JoinColumn()
  generalPreferences: GeneralPreferences;

  @Field(() => NotificationPreferences, { nullable: true })
  @OneToOne(() => NotificationPreferences)
  @JoinColumn()
  notificationPreferences: NotificationPreferences;

  @Column({ length: 20, unique: true })
  @Field(() => String)
  @Index()
  username: string;

  @Column()
  password: string;

  @Field(() => Profile, { nullable: true })
  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile;

  @CreateDateColumn()
  @Field(() => String)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => String)
  updatedAt: Date;

  @BeforeInsert()
  hashPassword = async () => {
    try {
      const hashedPassword = await bcrypt.hash(this.password, 12);
      this.password = hashedPassword;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('failed to hash password before inserting into db: ', e);
    }
  };
}

export default User;
