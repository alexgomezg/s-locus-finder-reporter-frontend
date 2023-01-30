export class RegionTreeDistance {
  constructor(
    public region: string,
    public regionSequence: string,
    public positiveBestSequence: string,
    public positiveMin: number,
    public negativeBestSequence: string,
    public negativeMin: number,
    public score: number) {
  }
}
