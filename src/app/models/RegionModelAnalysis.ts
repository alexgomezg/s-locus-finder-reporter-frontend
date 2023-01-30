import {RegionTreeDistance} from './RegionTreeDistance';

export class RegionModelAnalysis {
  constructor(
    public minTreeDistances: RegionTreeDistance[],
    public isoelectricPoints: number[],
    public genesInRegion: number,
    public modelFastaPath: string,
    public regionPdfPath: string,
    public phylogenyTreePath: string) {
  }
}
