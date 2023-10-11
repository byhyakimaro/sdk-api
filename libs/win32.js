import ffi from 'ffi-napi';

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

  open(command) {
    this.Shell32.ShellExecuteA(0, "open", "powershell", command, null, 0)
  }
}

(new ManagerWin32).open('start cmd')