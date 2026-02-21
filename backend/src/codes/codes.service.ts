import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Code } from './schemas/code.schema';
import { SpecialCode } from './schemas/special-code.schema';
import { SpecialCodeUsage } from './schemas/special-code-usage.schema';
import { GenerateCodeDto } from './dto/generate-code.dto';

@Injectable()
export class CodesService {
  constructor(
    @InjectModel(Code.name) private codeModel: Model<Code>,
    @InjectModel(SpecialCode.name) private specialCodeModel: Model<SpecialCode>,
    @InjectModel(SpecialCodeUsage.name) private specialCodeUsageModel: Model<SpecialCodeUsage>,
  ) {}

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
      tempo: dto.tempo,
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

  async verify(code: string, deviceId?: string) {
    const now = new Date();

    const specialCode = await this.specialCodeModel.findOne({ code, active: true });
    if (specialCode) {
      if (now > specialCode.expiresAt) {
        return { valid: false, message: 'Código não pode mais ser resgatado (período encerrado)' };
      }
      if (!deviceId) {
        return { valid: false, message: 'Header X-Device-ID ou query deviceId é obrigatório para este código' };
      }

      let usage = await this.specialCodeUsageModel.findOne({ code: specialCode.code, deviceId });
      if (!usage) {
        usage = await this.specialCodeUsageModel.create({
          code: specialCode.code,
          deviceId,
          firstUsedAt: now,
          nome: 'FreeUser',
        });
        const expiresAt = new Date(now.getTime() + specialCode.durationHours * 60 * 60 * 1000);
        return { valid: true, nome: usage.nome, tempo: specialCode.durationHours, expiresAt };
      }

      const tempoMs = specialCode.durationHours * 60 * 60 * 1000;
      const expiresAt = new Date(usage.firstUsedAt.getTime() + tempoMs);
      if (now.getTime() > expiresAt.getTime()) {
        return { valid: false, message: 'Código expirado para este dispositivo', nome: usage.nome };
      }
      return { valid: true, nome: usage.nome, tempo: specialCode.durationHours, expiresAt };
    }

    const entry = await this.codeModel.findOne({ code, active: true });
    if (!entry) {
      return { valid: false, message: 'Código não encontrado' };
    }

    if (entry.tempo instanceof Date) {
      if (now > entry.tempo) {
        return { valid: false, message: 'Código expirado', nome: entry.nome };
      }
      return { valid: true, nome: entry.nome, tempo: entry.tempo };
    }

    if (!entry.firstUsedAt) {
      entry.firstUsedAt = now;
      await entry.save();
      const expiresAt = new Date(now.getTime() + entry.tempo * 60 * 60 * 1000);
      return { valid: true, nome: entry.nome, tempo: entry.tempo, expiresAt };
    }

    const tempoMs = entry.tempo * 60 * 60 * 1000;
    const expiresAt = new Date(entry.firstUsedAt.getTime() + tempoMs);
    if (now.getTime() > expiresAt.getTime()) {
      return { valid: false, message: 'Código expirado', nome: entry.nome };
    }

    return { valid: true, nome: entry.nome, tempo: entry.tempo, expiresAt };
  }
}
