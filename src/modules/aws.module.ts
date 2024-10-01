import { Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { AwsService } from 'src/providers/aws.service';

@Module({
  providers: [S3Client, AwsService],
  exports: [AwsService],
})
export class AwsModule {}
