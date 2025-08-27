import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { IUser } from 'src/users/user.interface';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job, JobDocument } from './schemas/job.schema';

@Injectable()
export class JobsService {
  constructor(@InjectModel(Job.name) private jobModel : SoftDeleteModel<JobDocument>,
              private analyticsService: AnalyticsService){

  }
  async create(createJobDto: CreateJobDto, user : IUser) {
    let job =  await this.jobModel.create({
      ...createJobDto, createdBy : {
        _id : user._id,
        email : user.email
      }
    })
    
    // Track job creation event
    await this.analyticsService.trackEvent({
      event_type: 'JOB_CREATED',
      resource_id: job._id.toString(),
      user_id: user._id.toString(),
      metadata: {
        name: createJobDto.name,
        company: createJobDto.company,
        location: createJobDto.location,
        salary: createJobDto.salary
      }
    });
    
    return {
      _id  : job._id,
      createdAt : job.createdAt
    }
  }
  async update(id: string, updateJobDto: UpdateJobDto, user : IUser) {
    const result = await this.jobModel.updateOne({_id : id}, {
      ...updateJobDto, 
      updatedBy : {
        _id : user._id,
        email : user.email
      }
    })
    
    // Track job update event
    await this.analyticsService.trackEvent({
      event_type: 'JOB_UPDATED',
      resource_id: id,
      user_id: user._id.toString(),
      metadata: {
        updatedFields: Object.keys(updateJobDto)
      }
    });
    
    return result;
  }
  async remove(id: string, user : IUser) {
   await this.jobModel.updateOne({_id : id}, {
    deletedBy : {
      _id : user._id,
      email : user.email
    }
   })
   return this.jobModel.softDelete({_id : id})
  }
  async findOne(id: string, userInfo?: IUser) {
    let job = await this.jobModel.findOne({_id : id})
    
    // Track job view event
    if (job) {
      await this.analyticsService.trackEvent({
        event_type: 'JOB_VIEWED',
        resource_id: id,
        user_id: userInfo?._id?.toString(),
        metadata: {
          jobName: job.name,
          company: job.company
        }
      });
    }
    
    return job;
  }

  async findAll(currentPage : number, limit : number, qs : string) {
    const {filter, sort, projection, population} = aqp(qs)
    delete filter.current
    delete filter.pageSize
    let defaultLimit = limit ? limit : 10
    let offset = (currentPage - 1) * (limit)
    const totalItems =  await (await this.jobModel.find()).length
    const totalPages = Math.ceil(totalItems / defaultLimit)
    const result = await this.jobModel.find(filter).skip(offset).limit(defaultLimit).sort().populate(population).exec()
    return {
      meta : {
        current : currentPage, // trang hiện tại
        pageSize : limit, // số lượng bản ghi đã lấy
        pages : totalPages, // tổng số trang với điều kiện query
        total : totalItems // Tổng số lượng bản ghi trong db
      },
      result
    }
  }


}
