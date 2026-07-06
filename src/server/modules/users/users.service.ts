import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async findOne(id: string): Promise<User | null> {
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return null;
    }
    return this.userRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email) return null;
    return this.userRepo.findOne({ where: { email: ILike(email.trim()) } });
  }

  async create(userData: Partial<User>): Promise<User> {
    if (userData.email) {
      userData.email = userData.email.toLowerCase().trim();
    }
    const user = this.userRepo.create(userData);
    return this.userRepo.save(user);
  }
}
