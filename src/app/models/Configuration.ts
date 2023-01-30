export class Configuration {
  constructor(
    public readonly name: string,
    public readonly version: string,
    public readonly parameters: Map<String, String>
  ) {
  }
}
