import { IsNotEmpty, IsString } from "class-validator";

export class CreateNewFeatureOfAIDto{
    @IsNotEmpty()
    @IsString()
    category_name: string;
}