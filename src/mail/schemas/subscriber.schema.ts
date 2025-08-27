import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SubscriberDocument = HydratedDocument<Subscriber>

@Schema({timestamps : true})
export class Subscriber{
    @Prop({required: true})
    email : string;
    
    @Prop([String])
    skills : string[];
    
    @Prop()
    name : string;
    
    @Prop({default: true})
    isActive : boolean;
}

export const SubscriberSchema = SchemaFactory.createForClass(Subscriber)
