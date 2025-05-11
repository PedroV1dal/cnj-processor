import { CNJ } from "../entities/cnj";

export interface CNJRepository {
  save(cnj: CNJ): Promise<void>;
  findByNumber(number: string): Promise<CNJ | null>;
  updateStatus(number: string, status: string, data?: any): Promise<void>;
}
