import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsModule } from 'src/analytics/analytics.module';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports : [MongooseModule.forFeature([{
    name : User.name,
    schema : UserSchema
  },
  {
    name : Role.name,
    schema : RoleSchema
  },
]), AnalyticsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports : [UsersService]
})
export class UsersModule {}
