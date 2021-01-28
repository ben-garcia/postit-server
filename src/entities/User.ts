import bcrypt from 'bcrypt';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType, ID } from 'type-graphql';

@ObjectType()
@Entity('users')
class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Field(() => String)
  @Index()
  email: string;

  @Column({ unique: true })
  @Field(() => String)
  @Index()
  username: string;

  @Column({ default: false })
  @Field(() => Boolean)
  hasValidated: boolean;

  @Column()
  @Field(() => String)
  password: string;

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
