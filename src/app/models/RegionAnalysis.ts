import {NamedModelAnalysis} from './NamedModelAnalysis';

export class RegionAnalysis {
  constructor(
    public name: string,
    public modelAnalysis: NamedModelAnalysis) {
  }
}
