const ManagerWin32 = require("./libs/win32.js");

const win = new ManagerWin32()
win.ShellExecuteA('calc')
// win.regEditBg('ADB', 'Adb Server', 'C:\\Windows\\system32\\cmd.exe', 'wscript \"C:\\adb-sdk\\scrcpy-noconsole.vbs\"')

// class ManagerSDK {
//   constructor() {};


// }