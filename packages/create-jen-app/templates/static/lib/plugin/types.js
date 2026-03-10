/**
 * Plugin lifecycle and hook system.
 * Plugins hook into key stages of build, dev, and request handling.
 */
/**
 * Hookable stages available to plugins.
 */
export var HookStage;
(function (HookStage) {
  // Build lifecycle
  HookStage["BEFORE_BUILD"] = "beforeBuild";
  HookStage["AFTER_BUILD"] = "afterBuild";
  HookStage["BEFORE_ASSET_OPTIMIZE"] = "beforeAssetOptimize";
  HookStage["AFTER_ASSET_OPTIMIZE"] = "afterAssetOptimize";
  HookStage["BEFORE_RENDER"] = "beforeRender";
  HookStage["AFTER_RENDER"] = "afterRender";
  // Request lifecycle
  HookStage["BEFORE_REQUEST"] = "beforeRequest";
  HookStage["AFTER_REQUEST"] = "afterRequest";
  // Response generation
  HookStage["BEFORE_RESPONSE"] = "beforeResponse";
  HookStage["AFTER_RESPONSE"] = "afterResponse";
  // Cache operations
  HookStage["BEFORE_CACHE"] = "beforeCache";
  HookStage["AFTER_CACHE"] = "afterCache";
  // Custom stage (plugins can register their own)
  HookStage["CUSTOM"] = "custom";
})(HookStage || (HookStage = {}));
