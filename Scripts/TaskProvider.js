const LLDB_ADAPTER = "lldb";

class TaskProvider {
  constructor() { }

  provideTasks() {
    let task = new Task("Debug");
    // task.image = "";
    const action = new TaskDebugAdapterAction('lldb');
    action.command = "/usr/bin/lldb";
    task.setAction(action);

    return [];
  }

  /**
   * @param context TaskActionResolveContext
   */
  resolveTaskAction(context) {
    if (context.action !== Task.Run) return null;
    // TODO: Are there things to cleanup on behalf of LLDB?
    // else if (context.action.type === Task.Clean)
    // See https://docs.nova.app/api-reference/configuration/#getkey-coerce
    const config = context.config;

    // See https://docs.nova.app/extensions/debug-adapters
    const action = new TaskDebugAdapterAction(LLDB_ADAPTER);
    // TODO: https://lldb.llvm.org/use/tutorial.html
    action.command = "/usr/bin/lldb";
    if (!config) throw new Error("Invalid LLDB task");
    action.args = config.get("lldb.args", "array") || [];
    // TODO: Support https://docs.nova.app/api-reference/task-debug-adapter-action/#adapterstart
    action.debugArgs = {
      // See https://en.wikipedia.org/wiki/Uniform_Type_Identifier
      program: config.get("lldb.launchPath", "string"),
      args: config.get("lldb.launchArgs", "array") || [],
    };
    action.debugRequest = config.get("lldb.request", "string") || "launch";

    return action;
  }
}
exports.TaskProvider = TaskProvider;

// https://docs.nova.app/extensions/debug-adapters
class LldbDebugAdapter {
  // TODO: https://github.com/vadimcn/codelldb/tree/master/adapter

  // See https://docs.nova.app/api-reference/debug-session
  /** @type DebugSession[] */
  sessions = [];

  // See https://github.com/vadimcn/codelldb#languages
  /** @type string */
  syntax = null;
}
