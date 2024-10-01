import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
  constructor(
    private s3Client: S3Client,
    private configService: ConfigService,
  ) {}

  async uploadProfileImage(filename: string, file: Express.Multer.File) {
    return await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
        Key: `users/${filename}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
  }

  async deleteProfileImage(filename: string) {
    return await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
        Key: `users/${filename}`,
      }),
    );
  }

  getProfileImageUrl(filename: string) {
    return `${this.configService.get('AWS_CLOUDFRONT_URL')}/users/${filename}`;
  }
}
