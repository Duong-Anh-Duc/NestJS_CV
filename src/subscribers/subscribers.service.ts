import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/user.interface';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schema';

@Injectable()
export class SubscribersService {
    constructor(
        @InjectModel(Subscriber.name) private subscriberModel: SoftDeleteModel<SubscriberDocument>
    ){}
    async create(createSubscriberDto: CreateSubscriberDto, user: IUser) {
     const {name, email, skills} = createSubscriberDto;
     const isExist = await this.subscriberModel.findOne({ email });
     if (isExist) {
         throw new Error(`Email ${email} đã tồn tại! Vui lòng sử dụng email khác.`);
     }
    let newSubs = await this.subscriberModel.create({ name, email, skills,
        createdBy : {
            _id : user._id,
            email : user.email
        }
    });
    return {
        _id : newSubs?.id,
        createdBy : newSubs?.createdBy
    }
    }

    async findAll(currentPage: number, limit: number, qs: string) {
       const {filter, sort, population, projection} = aqp(qs)

       delete filter.current
       delete filter.pageSize

       let offset = (+currentPage - 1) * (+limit);
       let defaultLimit = +limit ? +limit : 10;
       const totalItems = (await this.subscriberModel.countDocuments());
       const totalPages = Math.ceil(totalItems / defaultLimit);
       const result = await this.subscriberModel.find(filter)
       .skip(offset)
       .limit(defaultLimit)
       .sort(sort as any)
       .select(projection)
       .populate(population)
       .exec()
       return {
        meta : {
           current : currentPage,
           pageSize : limit,
           pages : totalPages,
           total : totalItems
       },
       result
       }
    }

    findOne(id: string) {
        if(!mongoose.Types.ObjectId.isValid(id)) return 'Không tìm thấy người đăng ký';
        return this.subscriberModel.findOne({
        _id : id
        })
    }

    async getSubscriberSkills(user : IUser) {
        const {email} = user;
        return this.subscriberModel.findOne({email}, {skills : 1})
        
    }

    async update(id: string, updateSubscriberDto: UpdateSubscriberDto, user: IUser) {
       const updated = await this.subscriberModel.updateOne(
       {_id : id},
       {
        ...updateSubscriberDto,
        updatedBy : {
            _id : user._id,
            email : user.email
        }
       }
    )
    return updated
    }

    async updateOrCreateByEmail(email: string, updateSubscriberDto: UpdateSubscriberDto, user: IUser) {
        const updated = await this.subscriberModel.updateOne({
            email : email
        }, {
            ...updateSubscriberDto,
            updatedBy : {
                _id : user._id,
                email : user.email
            }
        },
        {upsert : true}
    )
    return updated
    }

    async remove(id: string, user: IUser) {
        if(!mongoose.Types.ObjectId.isValid(id)) return 'Không tìm thấy người đăng ký';
        await this.subscriberModel.updateOne({
            _id : id
        },{
            deletedBy : {
                _id : user._id,
                email : user.email
            }
        })
        await this.subscriberModel.softDelete({
            _id : id
        })
    }
}
