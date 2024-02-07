import {
  Injectable,
  HttpCode,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, DataSource } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { User } from '../users/entities/user.entity';
import { Offer } from './entities/offer.entity';
import { WishesService } from '../wishes/wishes.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    private readonly dataSource: DataSource,
    private wishesService: WishesService,
  ) {}

  @HttpCode(201)
  async createOffer(
    user: User,
    createOfferDto: CreateOfferDto,
  ): Promise<Offer> {
    const newOffer = this.offerRepository.create(createOfferDto);

    newOffer.user = user;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      newOffer.item = await this.wishesService.changeWishesRaisedSum(
        createOfferDto.itemId,
        newOffer.amount,
        user.id,
      );

      const result = await this.offerRepository.insert(newOffer);

      await queryRunner.commitTransaction();
      return this.findOfferById(result.identifiers[0].id);
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

  async findAllOffers(): Promise<Offer[]> {
    return await this.offerRepository.find();
  }

  async findOfferById(id: number): Promise<Offer> {
    const offer = await this.offerRepository.findOne({ where: { id } });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }
}
