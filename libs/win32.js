import ffi from 'ffi-napi';
import process from 'process';

class ManagerWin32 {
  constructor(){
    this.Shell32 = new ffi.Library("Shell32",{
      "ShellExecuteA": [
        "int32", ["int32","string","string","string","string","int"]
      ]
    })
  };

  _TEXT(text) {
    return Buffer.from(`${text}\0`, "ucs2");
  }

  shell32(command) {
    this.Shell32.ShellExecuteA(0, "open", "powershell", command, null, 0)
  }

  /**
  * @params variable String
  * @params variable String
  * @params variable String
  * @returns string
  */
  env(variable, value, action) {
    action === 'update' || action === 'create' ? process.env[variable] = value : delete process.env[variable]
    return process.env[variable]
  }
}

const win = new ManagerWin32
win.shell32('start cmd')
console.log(win.env('MSG', 'oi', 'update'))