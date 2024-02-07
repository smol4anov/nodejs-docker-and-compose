import {
  Injectable,
  HttpCode,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import {
  Repository,
  QueryFailedError,
  DataSource,
  In,
  DeleteResult,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
    private configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  @HttpCode(201)
  async createWish(user: User, createWishDto: CreateWishDto): Promise<Wish> {
    const newWish = this.wishRepository.create(createWishDto);
    newWish.owner = user;
    try {
      const result = await this.wishRepository.insert(newWish);
      return this.findWishById(result.identifiers[0].id);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        throw new BadRequestException(err.message);
      }
      throw new InternalServerErrorException();
    }
  }

  async findLastWishes(): Promise<Wish[]> {
    const result = await this.wishRepository.find({
      take: this.configService.get<number>('NUMBER_OF_LAST_WISHES', 40),
      order: {
        createdAt: 'DESC',
      },
    });
    return result;
  }

  async findTopWishes(): Promise<Wish[]> {
    return await this.wishRepository.find({
      take: this.configService.get<number>('NUMBER_OF_TOP_WISHES', 20),
      order: {
        copied: 'DESC',
      },
    });
  }

  async findWishById(id: number): Promise<Wish> {
    const wish = await this.wishRepository.findOne({
      where: {
        id,
      },
      relations: {
        owner: true,
        offers: {
          user: true,
        },
      },
    });
    if (!wish) {
      throw new NotFoundException('Wish not found');
    }
    return wish;
  }

  async findWishForUpdateOrDelete(id: number, userId: number): Promise<Wish> {
    const wish = await this.findWishById(id);
    if (wish.offers.length > 0) {
      throw new ForbiddenException('Wish has offers already');
    }
    if (wish.owner.id !== userId) {
      throw new ForbiddenException(`Forbidden to update someone else's wish`);
    }
    return wish;
  }

  async updateWish(
    id: number,
    userId: number,
    updateWishDto: UpdateWishDto,
  ): Promise<Wish> {
    const wish = await this.findWishForUpdateOrDelete(id, userId);

    Object.assign(wish, updateWishDto);
    try {
      return await this.wishRepository.save(wish);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        throw new BadRequestException(err.message);
      }
      throw new InternalServerErrorException();
    }
  }

  async removeWish(id: number, userId: number): Promise<DeleteResult> {
    await this.findWishForUpdateOrDelete(id, userId);

    return await this.wishRepository.delete(id);
  }

  async copyWish(wishId: number, user: User): Promise<Wish> {
    const wish = await this.findWishById(wishId);

    wish.copied++;

    const { name, link, image, price, description } = wish;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.wishRepository.save(wish);
      const newWish = this.createWish(user, {
        name,
        link,
        image,
        price,
        description,
      });
      await queryRunner.commitTransaction();
      return newWish;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (
        err instanceof QueryFailedError ||
        err instanceof BadRequestException
      ) {
        throw new BadRequestException(err.message);
      }
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  async changeWishesRaisedSum(
    wishId: number,
    amount: number,
    userId: number,
  ): Promise<Wish> {
    const wish = await this.findWishById(wishId);

    if (wish.price - wish.raised < amount) {
      throw new BadRequestException(
        'The offer amount cannot be more than the required amount',
      );
    }

    if (wish.owner.id === userId) {
      throw new BadRequestException('Сannot make an offer on your own wishes');
    }

    wish.raised += amount;
    return await this.wishRepository.save(wish);
  }

  async findManyWishesByIds(ids: number[]): Promise<Wish[]> {
    return await this.wishRepository.findBy({ id: In(ids) });
  }
}
