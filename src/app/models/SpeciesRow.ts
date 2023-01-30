import {RegionModelAnalysis} from './RegionModelAnalysis';
import {ModelAnalysis} from './ModelAnalysis';
import {RegionTreeDistance} from './RegionTreeDistance';

export class SpeciesRow {
  public readonly regionName: string;
  public readonly modelName: string;
  public readonly predicted?: RegionModelAnalysis;
  public readonly putative?: RegionModelAnalysis;

  constructor(
    regionName: string, modelAnalysis: ModelAnalysis
  ) {
    this.regionName = regionName;
    this.modelName = modelAnalysis.name;
    this.predicted = modelAnalysis.predicted;
    this.putative = modelAnalysis.putative;
  }

  public hasPredictedAnalysis() {
    return this.predicted !== null && this.predicted !== undefined;
  }

  public hasPutativeAnalysis() {
    return this.putative !== null && this.putative !== undefined;
  }

  public hasBothAnalysis() {
    return this.hasPredictedAnalysis() && this.hasPutativeAnalysis();
  }

  private getRegionModelAnalysis(predictedSelected: boolean): RegionModelAnalysis {
    if (predictedSelected) {
      return <RegionModelAnalysis>this.predicted;
    } else {
      return <RegionModelAnalysis>this.putative;
    }
  }

  public getMinTreeDistance(predictedSelected: boolean): RegionTreeDistance[] {
    const regionModelAnalysis = <RegionModelAnalysis>this.getRegionModelAnalysis(predictedSelected);
    return regionModelAnalysis.minTreeDistances;
  }

  public getPhylogenyTreePath(predictedSelected: boolean): string {
    const regionModelAnalysis = <RegionModelAnalysis>this.getRegionModelAnalysis(predictedSelected);
    return regionModelAnalysis.phylogenyTreePath;
  }

  public getRegionPdfPath(predictedSelected: boolean): string {
    const regionModelAnalysis = <RegionModelAnalysis>this.getRegionModelAnalysis(predictedSelected);
    return regionModelAnalysis.regionPdfPath;
  }

  public getModelFastaPath(predictedSelected: boolean): string {
    const regionModelAnalysis = <RegionModelAnalysis>this.getRegionModelAnalysis(predictedSelected);
    return regionModelAnalysis.modelFastaPath;
  }

  public getFboxInRegion(predictedSelected: boolean): number {
    const regionModelAnalysis = <RegionModelAnalysis>this.getRegionModelAnalysis(predictedSelected);
    return regionModelAnalysis.genesInRegion;
  }

  public getIsoelectricPoints(predictedSelected: boolean): number[] {
    const regionModelAnalysis = <RegionModelAnalysis>this.getRegionModelAnalysis(predictedSelected);
    return regionModelAnalysis.isoelectricPoints;
  }
}
