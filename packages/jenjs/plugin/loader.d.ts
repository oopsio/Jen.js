export interface Plugin {
    name: string;
    version?: string;
    onBuild?: () => void | Promise<void>;
    onServe?: () => void | Promise<void>;
    onDeploy?: () => void | Promise<void>;
}
export declare function runPlugins(event?: "build" | "serve" | "deploy"): Promise<void>;
