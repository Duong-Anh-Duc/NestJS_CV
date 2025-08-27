import { IsArray, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateSubscriberDto {
  @IsString({message : 'Email phải là chuỗi'})
  @IsEmail({}, {message : 'Email không hợp lệ'})
  @IsNotEmpty({message : 'Email không được để trống'})
  email: string;


  @IsNotEmpty({message : 'Tên không được để trống'})
  name: string;

  @IsNotEmpty({message : 'Kỹ năng không được để trống'})
  @IsArray({message : 'Kỹ năng phải là một mảng'})
  @IsString({each : true, message : 'Kỹ năng phải là chuỗi'})
  skills : string[]
}