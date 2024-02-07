import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { Repository, QueryFailedError, ILike } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseError } from 'pg';
import { hash } from 'bcrypt';
import { User } from './entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      createUserDto.password = await hash(createUserDto.password, 10);
      const result = await this.userRepository.insert(createUserDto);
      return this.findUserById(result.identifiers[0].id);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        const error = err.driverError as DatabaseError;
        if (error.code === '23505') {
          throw new ConflictException('Username or email already exist');
        }
      }
    }
  }

  async getUsersHiddenFields(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      select: { id: true, password: true, email: true },
      where: { username },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findUserById(id: number): Promise<User> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findCurrentUser(currentUser: User): Promise<User> {
    const hiddenFields = await this.getUsersHiddenFields(currentUser.username);
    return { ...currentUser, email: hiddenFields.email };
  }

  async findAndUpdateCurrentUser(
    currentUser: User,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    Object.assign(currentUser, updateUserDto);
    if (updateUserDto.password) {
      currentUser.password = await hash(updateUserDto.password, 10);
    }
    try {
      const { password, ...user } = await this.userRepository.save(currentUser);
      return user;
    } catch (err) {
      if (err instanceof QueryFailedError) {
        throw new BadRequestException(err.message);
      }
    }
  }

  async findUserByUsername(username: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { username },
    });
  }

  async findUsersWishesByUsername(username: string): Promise<Wish[]> {
    const user = await this.userRepository.findOne({
      relations: {
        wishes: true,
      },
      where: { username },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.wishes;
  }

  async findUserByQuery(findUserDto: FindUserDto): Promise<User[]> {
    return await this.userRepository.find({
      where: [
        { username: ILike(`%${findUserDto.query}%`) },
        { email: ILike(`%${findUserDto.query}%`) },
      ],
    });
  }
}
