import {Configuration} from './Configuration';
import {NamedFamilyAnalysis} from './NamedFamilyAnalysis';
import {SLFDatabaseInformation} from './SLFDatabaseInformation';

export class SLFDatabase {
  constructor(
    public readonly info: SLFDatabaseInformation,
    public readonly newick: string,
    public readonly families: NamedFamilyAnalysis,
    public readonly configurations: Configuration
  ) {
  }
}
