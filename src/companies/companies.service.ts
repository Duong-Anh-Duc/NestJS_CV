import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/user.interface';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company, CompanyDocument } from './schemas/company.schema';

@Injectable()
export class CompaniesService {
  constructor(@InjectModel(Company.name) private companyModel : SoftDeleteModel<CompanyDocument>){

  }
  create(createCompanyDto: CreateCompanyDto, user : IUser) {
    return this.companyModel.create({...createCompanyDto,
      createdBy : {
        _id : user._id,
        email : user.email
      } 
    })
  }

  async findAll(page : number, limit : number, qs : string) {
    const {filter, sort, projection, population} = aqp(qs)
    delete filter.current
    delete filter.pageSize
    let defaultLimit = limit ? limit : 10
    let offset = (page - 1) * (limit)
    const totalItems =  await (await this.companyModel.find()).length
    const totalPages = Math.ceil(totalItems / defaultLimit)
    const result = await this.companyModel.find(filter).skip(offset).limit(defaultLimit).sort().populate(population).exec()
    return {
      meta : {
        current : page, // trang hiện tại
        pageSize : limit, // số lượng bản ghi đã lấy
        pages : totalPages, // tổng số trang với điều kiện query
        total : totalItems // Tổng số lượng bản ghi trong db
      },
      result
    }
  }

 async findOne(id: string) {
    let company = await this.companyModel.findOne({_id : id})
    if(!company){
      return "Company not found"
    }
    return company
  }

  update(id: string, updateCompanyDto: UpdateCompanyDto, user : IUser) {
    return this.companyModel.updateOne({
      _id : id
    }, {...updateCompanyDto, 
      updatedBy : {
        _id : user._id,
        email : user.email
      }
    })
  }

  async remove(id: string, user : IUser) {
    await this.companyModel.updateOne({
      _id : id
    }, {
      deletedBy : {
        _id : user._id,
        email : user.email
      }
    })
    return this.companyModel.softDelete({
      _id : id
    })
  }
}
