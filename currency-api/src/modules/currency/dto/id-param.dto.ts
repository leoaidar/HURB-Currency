import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class IdParamDto {

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  id: string;

}
