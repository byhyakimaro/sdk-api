const ManagerWin32 = require("./libs/win32.js");

// win.regEditBg('ADB', 'Adb Server', 'C:\\Windows\\system32\\cmd.exe', 'wscript \"C:\\adb-sdk\\scrcpy-noconsole.vbs\"')

class ManagerSDK {
  constructor() {
    this.Win32 = new ManagerWin32()
    const cmd = this.Win32.ShellExecuteWrapper('start cmd')
    console.log(cmd)
  };
}
new ManagerSDK()