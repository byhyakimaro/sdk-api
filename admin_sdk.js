import ManagerWin32 from "./libs/win32.js";

const win = new ManagerWin32
win.shell32('runas /savecred /user:adm cmd')
win.regEditBg('ADB', 'Adb Server', 'C:\\Windows\\system32\\cmd.exe', 'wscript \"C:\\adb-sdk\\scrcpy-noconsole.vbs\"')

// class ManagerAdminSDK {
//   constructor() {};

  
// }