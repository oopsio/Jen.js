import { SSGPipeline } from "./ssg-pipeline.js";
import { log } from "../shared/log.js";
export class ProductionBuilder {
    /**
     * Run the production build sequence
     */
    static async build(opts) {
        log.info("--- PRODUCTION BUILD START ---");
        const pipeline = new SSGPipeline(opts.config);
        await pipeline.run();
        log.info("--- PRODUCTION BUILD COMPLETE ---");
    }
}
