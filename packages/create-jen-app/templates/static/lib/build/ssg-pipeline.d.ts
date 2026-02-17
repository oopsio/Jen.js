import { FrameworkConfig } from '../core/config.js';
export declare class SSGPipeline {
    private config;
    private dist;
    constructor(config: FrameworkConfig);
    /**
     * Run the full SSG Pipeline
     */
    run(): Promise<void>;
    private prepareDist;
    private processAssets;
    private compileStyles;
    private renderPages;
    private copyRecursive;
}
