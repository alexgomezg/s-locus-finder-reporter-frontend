import {RegionModelAnalysis} from './RegionModelAnalysis';

export class ModelAnalysis {
  constructor(
    public name: string,
    public predicted?: RegionModelAnalysis,
    public putative?: RegionModelAnalysis
  ) {
  }
}
