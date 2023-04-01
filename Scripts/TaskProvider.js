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
    if (context.action.type !== Task.Run) return null;
    // TODO: Are there things to cleanup on behalf of LLDB?
    // else if (context.action.type === Task.Clean)
    const config = context.config;

    // https://en.wikipedia.org/wiki/Uniform_Type_Identifier

    const action = new TaskDebugAdapterAction('lldb');
    // TODO: https://lldb.llvm.org/use/tutorial.html
    action.command = "/usr/bin/lldb";
    // See https://docs.nova.app/api-reference/configuration/#getkey-coerce
    if (config) {
      action.args = config.get("lldb.args", "array") || [];
      // TODO: Support https://docs.nova.app/api-reference/task-debug-adapter-action/#adapterstart
      action.debugArgs = {
        program: config.get("lldb.launchPath", "string"),
        args: config.get("lldb.launchArgs", "array") || [],
      };
      action.debugRequest = config.get("lldb.request", "string") || "launch";
    }

    return action;
  }
}
exports.TaskProvider = TaskProvider;
