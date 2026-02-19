import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Admin } from './schemas/admin.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectModel(Admin.name) private adminModel: Model<Admin>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'mastercheat_secret_key_2026_xK9mP2vL',
    });
  }

  async validate(payload: { id: string }) {
    const admin = await this.adminModel.findById(payload.id).select('-password');
    if (!admin) {
      throw new UnauthorizedException('Token inválido');
    }
    return admin;
  }
}
