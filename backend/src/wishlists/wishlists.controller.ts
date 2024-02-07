import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Controller('wishlistlists')
@UseGuards(JwtGuard)
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post()
  create(@Request() req, @Body() createWishlistDto: CreateWishlistDto) {
    return this.wishlistsService.createWishlist(req.user, createWishlistDto);
  }

  @Get()
  findAll() {
    return this.wishlistsService.findAllWishlists();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wishlistsService.findWishlistById(+id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    return this.wishlistsService.updateWishlist(
      +id,
      req.user.id,
      updateWishlistDto,
    );
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.wishlistsService.removeWishlist(+id, req.user.id);
  }
}
