import { CommonEntity } from '../../entites/base.entity';
import { User } from '../../users/entities/user.entity';
import { DecimalColumnTransformer } from '../../utils/decimal-column-transformer';
import { Wish } from '../../wishes/entities/wish.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity()
export class Offer extends CommonEntity {
  @ManyToOne(() => User, (user: User) => user.offers)
  user: User;

  @ManyToOne(() => Wish, (wish: Wish) => wish.offers, { onDelete: 'CASCADE' })
  item: Wish;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new DecimalColumnTransformer(),
  })
  amount: number;

  @Column({ default: false })
  hidden: boolean;
}
