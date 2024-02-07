import { CommonEntity } from '../../entites/base.entity';
import { Wish } from '../../wishes/entities/wish.entity';
import { Entity, Column, ManyToMany, ManyToOne } from 'typeorm';
import { Length, IsUrl } from 'class-validator';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Wishlist extends CommonEntity {
  @Column()
  @Length(1, 250)
  name: string;

  @Column({ length: 1500, nullable: true })
  description: string;

  @Column()
  @IsUrl()
  image: string;

  @ManyToOne(() => User, (user: User) => user.wishlists)
  owner: User;

  @ManyToMany(() => Wish, (wish: Wish) => wish.lists, { onDelete: 'CASCADE' })
  items: Wish[];
}
