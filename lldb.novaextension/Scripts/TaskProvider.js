const LLDB_ADAPTER = "lldb";
const PORT = 1234;

const HOME = nova.environment["HOME"] || "~";

// Application types
// See https://en.wikipedia.org/wiki/Uniform_Type_Identifier
const MAC_APP = "app";
const UNIX_APP = "public.unix-executable";
const PLAYDATE_APP = "com.panic.playdate.pdx";

const PLAYDATE_SDK = `${HOME}/Developer/PlaydateSDK`;
const PLAYDATE_SIMULATOR = `${PLAYDATE_SDK}/bin/Playdate Simulator.app`;

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
  async resolveTaskAction(context) {
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
    let launchPath = config.get("launchPath", "string");
    if (!launchPath) throw "Invalid LLDB task configuration: You must provide a Program to launch or attach to.";
    /** @type string[] */
    const launchArgs = config.get("launchArgs", "array") || [];
    const cwd = nova.path.normalize(config.get("cwd", "string") || nova.workspace.path);

    // Launch the Playdate Simulator if the debugee is a Playdate app
    const isPlaydateApp = await this.isPlaydateApp(launchPath);
    if (isPlaydateApp) {
      console.log(`launching playdate app: "${launchPath}"`);
      const userLaunchPath = launchPath;
      launchPath = PLAYDATE_SIMULATOR;
      launchArgs.splice(0, 0, `"${userLaunchPath}"`);
      // TODO: Support attaching to a running instance of the Playdate Simulator
    }

    action.debugArgs = {
      program: nova.path.normalize(nova.path.expanduser(launchPath)),
      args: launchArgs,
      cwd,
      stopOnEntry: config.get("stopOnEntry", "boolean") || false,
    };
    action.debugRequest = config.get("request", "string") || "launch";

    return action;
  }

  /**
   * @param path {string}
   * @returns {Promise<boolean>}
   */
  isPlaydateApp(path) {
    return new Promise((resolve, reject) => {
      // See https://en.wikipedia.org/wiki/Uniform_Type_Identifier#Looking_up_a_UTI
      const mdls = new Process("/usr/bin/mdls", {
        args: ["-name", "kMDItemContentType", path],
        stdio: ["ignore", "pipe", "ignore"],
      });
      mdls.onStdout(line => {
        if (line.includes(PLAYDATE_APP)) resolve(true);
      });
      mdls.onDidExit(status => (status !== 0 ? reject(status) : resolve(false)));
      mdls.start();
    });
  }
}
exports.TaskProvider = TaskProvider;

// https://docs.nova.app/extensions/debug-adapters
