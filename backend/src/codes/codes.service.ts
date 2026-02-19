import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Code } from './schemas/code.schema';
import { GenerateCodeDto } from './dto/generate-code.dto';

@Injectable()
export class CodesService {
  constructor(@InjectModel(Code.name) private codeModel: Model<Code>) {}

  private generateCode(length = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async generate(dto: GenerateCodeDto, adminId: string) {
    let code: string;
    let exists = true;

    while (exists) {
      code = this.generateCode();
      exists = !!(await this.codeModel.findOne({ code }));
    }

    return this.codeModel.create({
      code,
      nome: dto.nome,
      tempo: new Date(dto.tempo),
      createdBy: adminId,
    });
  }

  async findAll() {
    return this.codeModel
      .find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username');
  }

  async remove(id: string) {
    const code = await this.codeModel.findByIdAndDelete(id);
    if (!code) {
      throw new NotFoundException('Código não encontrado');
    }
    return { message: 'Código removido com sucesso' };
  }

  async verify(code: string) {
    const entry = await this.codeModel.findOne({ code, active: true });
    if (!entry) {
      return { valid: false, message: 'Código não encontrado' };
    }
    if (new Date() > entry.tempo) {
      return { valid: false, message: 'Código expirado', nome: entry.nome };
    }
    return { valid: true, nome: entry.nome, tempo: entry.tempo };
  }
}
