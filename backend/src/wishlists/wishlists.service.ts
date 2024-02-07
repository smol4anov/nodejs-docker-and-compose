import {
  Injectable,
  HttpCode,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, DeleteResult } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';
import { User } from '../users/entities/user.entity';
import { WishesService } from '../wishes/wishes.service';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    private wishesService: WishesService,
  ) {}

  @HttpCode(201)
  async createWishlist(
    user: User,
    createWishlistDto: CreateWishlistDto,
  ): Promise<Wishlist> {
    const wishes = await this.wishesService.findManyWishesByIds(
      createWishlistDto.itemsId,
    );
    const newWishlist = this.wishlistRepository.create({
      ...createWishlistDto,
      owner: user,
      items: wishes,
    });

    try {
      return await this.wishlistRepository.save(newWishlist);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        throw new BadRequestException(err.message);
      }
      throw new InternalServerErrorException();
    }
  }

  async findAllWishlists(): Promise<Wishlist[]> {
    return await this.wishlistRepository.find({
      relations: {
        owner: true,
        items: true,
      },
    });
  }

  async findWishlistById(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({
      where: {
        id,
      },
      relations: {
        owner: true,
        items: true,
      },
    });
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }
    return wishlist;
  }

  async updateWishlist(
    id: number,
    userId: number,
    updateWishlistDto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    const wishlist = await this.findWishlistById(id);
    if (!wishlist) {
      throw new NotFoundException('Wish not found');
    }

    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException(
        `Forbidden to update someone else's wishlist`,
      );
    }
    Object.assign(wishlist, updateWishlistDto);
    wishlist.items = await this.wishesService.findManyWishesByIds(
      updateWishlistDto.itemsId,
    );
    try {
      return await this.wishlistRepository.save(wishlist);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        throw new BadRequestException(err.message);
      }
      throw new InternalServerErrorException();
    }
  }

  async removeWishlist(id: number, userId: number): Promise<DeleteResult> {
    const wishlist = await this.findWishlistById(id);
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }
    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException(`Forbidden to delete someone else's wish`);
    }
    return await this.wishlistRepository.delete(id);
  }
}
