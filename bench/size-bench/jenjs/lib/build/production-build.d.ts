import { FrameworkConfig } from "../core/config.js";
export interface ProductionBuildConfig {
  config: FrameworkConfig;
}
export declare class ProductionBuilder {
  /**
   * Run the production build sequence
   */
  static build(opts: ProductionBuildConfig): Promise<void>;
}
