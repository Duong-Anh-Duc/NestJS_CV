import { OmitType } from "@nestjs/mapped-types";
import { CreateSubscriberDto } from "./create-subscriber.dto";

export class UpdateSubscriberDto extends OmitType(CreateSubscriberDto, ['email'] as const) {}