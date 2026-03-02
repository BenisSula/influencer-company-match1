import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilterPreset } from './entities/filter-preset.entity';
import { CreateFilterPresetDto } from './dto/create-filter-preset.dto';

@Injectable()
export class FilterPresetService {
  constructor(
    @InjectRepository(FilterPreset)
    private readonly presetRepository: Repository<FilterPreset>,
  ) {}

  async createPreset(
    userId: string,
    dto: CreateFilterPresetDto,
  ): Promise<FilterPreset> {
    // Check if user has reached the limit of 10 presets
    const count = await this.presetRepository.count({
      where: { user: { id: userId } },
    });

    if (count >= 10) {
      throw new BadRequestException(
        'Maximum of 10 filter presets allowed. Please delete an existing preset to create a new one.',
      );
    }

    const preset = this.presetRepository.create({
      user: { id: userId },
      name: dto.name,
      filters: dto.filters,
    });

    return this.presetRepository.save(preset);
  }

  async getPresets(userId: string): Promise<FilterPreset[]> {
    return this.presetRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getPresetById(userId: string, presetId: string): Promise<FilterPreset> {
    const preset = await this.presetRepository.findOne({
      where: { id: presetId, user: { id: userId } },
    });

    if (!preset) {
      throw new NotFoundException('Filter preset not found');
    }

    return preset;
  }

  async deletePreset(userId: string, presetId: string): Promise<void> {
    const result = await this.presetRepository.delete({
      id: presetId,
      user: { id: userId },
    });

    if (result.affected === 0) {
      throw new NotFoundException('Filter preset not found');
    }
  }

  async updatePreset(
    userId: string,
    presetId: string,
    dto: CreateFilterPresetDto,
  ): Promise<FilterPreset> {
    const preset = await this.getPresetById(userId, presetId);

    preset.name = dto.name;
    preset.filters = dto.filters;

    return this.presetRepository.save(preset);
  }
}
