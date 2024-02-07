import { Entity, Column, OneToMany } from 'typeorm';
import { Length, IsUrl, IsEmail } from 'class-validator';
import { Wish } from '../../wishes/entities/wish.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { Wishlist } from '../../wishlists/entities/wishlist.entity';
import { CommonEntity } from '../../entites/base.entity';

@Entity()
export class User extends CommonEntity {
  @Column({ length: 30, unique: true })
  @Length(2, 30)
  username: string;

  @Column({ length: 200, default: 'Пока ничего не рассказал о себе' })
  @Length(2, 200)
  about: string;

  @Column({ default: 'https://i.pravatar.cc/300' })
  @IsUrl()
  avatar: string;

  @Column({ unique: true, select: false })
  @IsEmail()
  email: string;

  @Column({ select: false })
  password: string;

  @OneToMany(() => Wish, (wish: Wish) => wish.owner)
  wishes: Wish[];

  @OneToMany(() => Offer, (offer: Offer) => offer.user)
  offers: Offer[];

  @OneToMany(() => Wishlist, (wishlist: Wishlist) => wishlist.owner)
  wishlists: Wishlist[];
}
