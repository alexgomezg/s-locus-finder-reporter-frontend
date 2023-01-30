import {NamedSpeciesAnalysis} from './NamedSpeciesAnalysis';

export class FamilyAnalysis {
  constructor(
    public readonly name: string,
    public readonly speciesAnalysis: NamedSpeciesAnalysis
  ) {
  }
}
