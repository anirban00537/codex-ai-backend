import { IsNotEmpty, IsNumber } from "class-validator";

export class MakeTemplateFavourite {
    @IsNotEmpty()
    @IsNumber()
    template_id: number
}