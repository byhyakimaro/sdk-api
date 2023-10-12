import ffi from 'ffi-napi';
import ref from 'ref-napi';
import process from 'process';
import sudo from 'sudo-prompt';

export default class ManagerWin32 {
  constructor() {
    this.shell32 = new ffi.Library("Shell32", {
      "ShellExecuteA": [
        "int32", ["int32", "string", "string", "string", "string", "int"]
      ]
    });
    this.ntdll = ffi.Library('ntdll', {
      'NtQuerySystemInformation': ['uint32', ['int', 'pointer', 'uint32', 'pointer']]
    });
  };

  _TEXT(text) {
    return Buffer.from(`${text}\0`, "ucs2");
  }

  ShellExecuteA(command) {
    this.shell32.ShellExecuteA(0, "open", "powershell", command, null, 0);
  }

  hidden() {
    const STATUS_SUCCESS = 0;
    const SystemProcessInformation = 5;

    const bufferSize = 412880;
    const buffer = Buffer.alloc(bufferSize);

    const returnLength = Buffer.alloc(4); 
    const status = this.ntdll.NtQuerySystemInformation(SystemProcessInformation, buffer, buffer.length, returnLength);

    if (status === STATUS_SUCCESS) {
      
      console.log(status);
      // const processCount = buffer.readUInt32LE(0x00);
      // let ENTRY_SIZE = 0x40;

      // for (let i = 0; i < processCount; i++) {
      //   const processName = buffer.toString('hex');

      //   console.log(processName);
      //   ENTRY_SIZE += buffer.readUInt32LE(ENTRY_SIZE);
      //   break;
      // }
    } else {
      console.error('Erro ao chamar NtQuerySystemInformation:', status);
    }
  }

/**
* @params {String} - name of environment variable
* @params {String} - value variable
* @params {'create' | 'update' | 'delete'} - action in which to execute
* @returns {String} - value variable after update
*/
env(variable, value, action) {
  action === 'update' || action === 'create' ? process.env[variable] = value : delete process.env[variable];
  return process.env[variable];
};

/**
* @params {String} - name of context regedit
* @params {String} - Title of context
* @params {String} - Icon path example: "C:\\Windows\\system32\\cmd.exe"
* @params {String} - command execute in background example: '"C:\Program Files\Git\git-bash.exe" "--cd=%v."'
* @returns {String} - result of register
*/
regEditBg(nameContext, TitleContext, IconPath, command) {
  const registerPathIcon = `HKEY_CLASSES_ROOT\\directory\\background\\shell\\${nameContext}`;
  const registerIcon = `reg add "${registerPathIcon}" /v "${TitleContext}" /t REG_SZ /d "${IconPath}" /f`;

  const registerPathCommand = `HKEY_CLASSES_ROOT\\directory\\background\\shell\\${nameContext}\\command`;
  const registerCommand = `reg add "${registerPathCommand}" /t REG_SZ /d "${command}" /f`;

  sudo.exec(`${registerIcon} | ${registerCommand}`, { name: 'PathIcon' },
    function (error, stdout, stderr) {
      if (error) throw error;
      console.log('stdout: ' + stdout);
    }
  );
};
};