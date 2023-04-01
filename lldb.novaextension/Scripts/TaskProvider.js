const LLDB_ADAPTER = "lldb";
const PORT = 1234;

// See https://github.com/vadimcn/codelldb#languages
// See https://docs.nova.app/api-reference/debug-session
/** @type {syntax: string, session: DebugSession}[] */
const sessions = [];

/** @interface DebugSession {syntax: string, session: DebugSession} */

class TaskProvider {
  constructor() {
    nova.workspace.onDidStartDebugSession(function sessionStarted(session) {
      if (session.type !== LLDB_ADAPTER) return;
      console.log("session started");
      sessions.push({ session, syntax: null });
    });
    nova.workspace.onDidEndDebugSession(function sessionEnded(session) {
      if (session.type !== LLDB_ADAPTER) return;
      console.log("session ended");
      sessions.splice(
        sessions.findIndex(x => x.session.identifier === session.identifier),
        1
      );
    });
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
    action.transport = "socket";
    action.socketPort = PORT;
    // TODO: https://lldb.llvm.org/use/tutorial.html
    action.command = nova.path.join(nova.extension.path, "bin/codelldb");
    if (!config) throw new Error("Invalid LLDB task");
    action.args = ["--port", PORT.toString()];
    // TODO: action.args = config.get("args", "array") || [];
    // TODO: Support https://docs.nova.app/api-reference/task-debug-adapter-action/#adapterstart
    if (!config.get("launchPath", "string")) {
      console.error("Invalid task configuration.");
      throw "Invalid LLDB task configuration: You must provide a Program to launch or attach to.";
    }
    action.debugArgs = {
      // See https://en.wikipedia.org/wiki/Uniform_Type_Identifier
      program: config.get("launchPath", "string"),
      args: config.get("launchArgs", "array") || [],
    };
    action.debugRequest = config.get("request", "string") || "launch";

    return action;
  }
}
exports.TaskProvider = TaskProvider;

// https://docs.nova.app/extensions/debug-adapters
class LldbDebugAdapter {}
