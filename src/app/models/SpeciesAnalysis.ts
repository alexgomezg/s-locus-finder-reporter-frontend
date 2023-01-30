import {NamedRegionAnalysis} from './NamedRegionAnalysis';

export class SpeciesAnalysis {
  constructor(
    public regionAnalysis: NamedRegionAnalysis,
    public name: string,
    public predictedSkp1?: number,
    public putativeSkp1?: number,
    public predictedSkp1TreePath?: string,
    public putativeSkp1TreePath?: string) {
  }


}
