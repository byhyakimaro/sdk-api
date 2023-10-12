import ManagerWin32 from "./libs/win32.js";

const win = new ManagerWin32()
// win.ShellExecuteA('runas /savecred /user:adm cmd')
// win.regEditBg('ADB', 'Adb Server', 'C:\\Windows\\system32\\cmd.exe', 'wscript \"C:\\adb-sdk\\scrcpy-noconsole.vbs\"')
win.HookManagerTask()

// class ManagerAdminSDK {
//   constructor() {};

  
// }