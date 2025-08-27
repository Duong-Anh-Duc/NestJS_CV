import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { IS_PUBLIC_KEY, IS_PUBLIC_PERMISSION } from "./decorator/customize";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){
    constructor(private reflector : Reflector){
        super();
    }
    canActivate(context: ExecutionContext){
       const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()]
       )
       if(isPublic) return true
       return super.canActivate(context)
        
    }
    handleRequest(err, user, info, context : ExecutionContext) {
        const request : Request = context.switchToHttp().getRequest();
        const isSkipPermission = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_PERMISSION,
        [context.getHandler(), context.getClass()]
       )
        const targetMethod = request.method
        const targetEndpoint : string = request.route?.path
        const permissions = user?.permissions ?? []
        let isExits = permissions.find(permission => permission.method === targetMethod && permission.apiPath === targetEndpoint)
        //console.log(targetEndpoint, targetMethod, isExits)
        if(!isExits && targetMethod === "GET" && targetEndpoint.startsWith("/api/v1/subscribers")) isExits = true
        if(targetEndpoint.startsWith("/api/v1/auth")) isExits = true
        if(targetEndpoint.startsWith("/api/v1/files")) isExits = true
        if(!isExits && !isSkipPermission) {
            throw new ForbiddenException(`Bạn không có quyền truy cập vào ${targetMethod} ${targetEndpoint}`)
        }
        if(err || !user){
            throw err || new UnauthorizedException("Token không hợp lệ!")
        }
        return user
    }
}
