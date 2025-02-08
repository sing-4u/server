import { Injectable, HttpException } from '@nestjs/common';
import { AdminRepository } from 'src/repositories/admin.repository';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AwsService } from './aws.service';

@Injectable()
export class AdminService {
  constructor(
    private adminRepository: AdminRepository,
    private jwtService: JwtService,
    private awsService: AwsService,
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

  async getArtists(query: {
    index: number;
    sort: 'latest' | 'isOpen' | 'songListCount';
    search?: string;
  }) {
    const artists = await this.adminRepository.getArtists(query);

    return artists.map((artist) => {
      return {
        id: artist.id,
        name: artist.name,
        email: artist.email,
        image: artist.image
          ? this.awsService.getProfileImageUrl(artist.image)
          : null,
        createdAt: artist.createdAt,
        isOpened: artist.isOpened,
        songListCount: artist._count.SongList,
      };
    });
  }

  async getArtist(id: string) {
    const artist = await this.adminRepository.getArtist(id);
    const requests = await this.adminRepository.getRequest(artist.email);
    const songLists = await this.adminRepository.getSongList(id);

    return {
      artist,
      requests: requests.map((request) => {
        return {
          createdAt: request.createdAt,
          songArtist: request.artist,
          songTitle: request.title,
          artistName: request.songList.user.name,
        };
      }),
      songLists,
    };
  }

  async open(userId: string) {
    return await this.adminRepository.open(userId);
  }

  async close(userId: string) {
    return await this.adminRepository.close(userId);
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
