import { Injectable, HttpException } from '@nestjs/common';
import { AdminRepository } from 'src/repositories/admin.repository';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

@Injectable()
export class AdminService {
  constructor(
    private adminRepository: AdminRepository,
    private jwtService: JwtService,
  ) {}

  async register(input: RegisterInput) {
    const hashedPassword = await argon2.hash(input.password);
    await this.adminRepository.create({
      id: input.id,
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
    });
    return;
  }

  async login(id: string, password: string) {
    const admin = await this.adminRepository.findOne(id);
    const isValidPassword = await argon2.verify(admin.password, password);
    if (!isValidPassword) {
      throw new HttpException('Invalid password', 401);
    }

    const accessToken = this.jwtService.sign({
      id: admin.id,
      role: admin.role,
    });
    return { accessToken };
  }

  async getAdmins() {
    return await this.adminRepository.getAdmins();
  }

  async deleteAdmin(id: string) {
    return await this.adminRepository.deleteOne(id);
  }

  async updateAdmin(id: string, input: UpdateInput) {
    const hashedPassword = await argon2.hash(input.password);
    return await this.adminRepository.updateOne(id, {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
    });
  }
}

type RegisterInput = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
};

type UpdateInput = {
  name: string;
  email: string;
  password: string;
  role: string;
};
