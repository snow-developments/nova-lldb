class TaskProvider {
  constructor() { }

  provideTasks() {
    let task = new Task("Say Example");

    // TODO: https://lldb.llvm.org/use/tutorial.html
    task.setAction(Task.Run, new TaskProcessAction('/usr/bin/say', {
      args: ["I'm Running!"],
      env: {}
    }));

    // TODO: Are there things to cleanup on behalf of LLDB?
    // task.setAction(Task.Clean, new TaskProcessAction('/usr/bin/say', {
    //   args: ["I'm Cleaning!"],
    //   env: {}
    // }));
    return [task];
  }
}
exports.TaskProvider = TaskProvider;
