  import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ResponseMessage, SkipPermission, User } from 'src/auth/decorator/customize';
import { IUser } from 'src/users/user.interface';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { SubscribersService } from './subscribers.service';

  @Controller('subscribers')
  export class SubscribersController {
    constructor(private readonly subscribersService: SubscribersService) {}
    @Post()
    @ResponseMessage("Tạo mới người đăng ký thành công")
    createSubscriber(@Body() createSubscriberDto: CreateSubscriberDto, @User() user: IUser) {
      return this.subscribersService.create(createSubscriberDto, user);
    }

    @Get()
    @ResponseMessage("Lấy danh sách người đăng ký thành công")
    findAll(
      @Query('current') currentPage : string,
      @Query('pageSize') limit : string,
      @Query() qs : string
    ) {
      return this.subscribersService.findAll(+currentPage, +limit, qs);
    }

    @Post('skills')
    @ResponseMessage("Lấy danh sách skills của subscribers")
    @SkipPermission()
    getSubscriberSkills(@User() user: IUser) {
      return this.subscribersService.getSubscriberSkills(user);
    }

    @Get(':id')
    @ResponseMessage("Lấy thông tin người đăng ký thành công")
    findOne(@Param('id') id: string) {
      return this.subscribersService.findOne(id);
    }

    @Patch(':id')
    @ResponseMessage("Cập nhật người đăng ký thành công")
    update(@Param('id') id: string, @Body() updateSubscriberDto: UpdateSubscriberDto, @User() user : IUser){
      return this.subscribersService.update(id, updateSubscriberDto, user);
    }

    @Patch()
    @SkipPermission()
    @ResponseMessage("Cập nhật hoặc tạo mới subscriber theo email")
    updateOrCreate(@Body() body: { email: string } & UpdateSubscriberDto, @User() user : IUser){
      const { email, ...updateData } = body;
      return this.subscribersService.updateOrCreateByEmail(email, updateData, user);
    }

    @Delete(':id')
    @ResponseMessage("Xóa người đăng ký thành công")
    remove(@Param('id') id: string, @User() user: IUser) {
      return this.subscribersService.remove(id, user);
    }
  }