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
      'NtQuerySystemInformation': ['int', ['int', 'pointer', 'uint', 'pointer']]
    });
  };

  _TEXT(text) {
    return Buffer.from(`${text}\0`, "ucs2");
  }

  ShellExecuteA(command) {
    this.shell32.ShellExecuteA(0, "open", "powershell", command, null, 0);
  }

  hidden() {
    const SystemProcessInformation = 5;
    const STATUS_SUCCESS = 0;

    const buffer = Buffer.alloc(4096); // Tamanho do buffer, você pode ajustar conforme necessário

    function getProcessList() {
      const status = this.ntdll.NtQuerySystemInformation(SystemProcessInformation, buffer, buffer.length, null);

      if (status === STATUS_SUCCESS) {
        let offset = 0;
        while (true) {
          const entry = buffer.readUInt32LE(offset);
          const nextEntryOffset = buffer.readUInt32LE(offset + 4);
          const imageNamePtr = buffer.readUInt32LE(offset + 8);
          const imageNameLength = buffer.readUInt16LE(offset + 12) / 2; // dividido por 2 pois cada caractere é de 2 bytes
          const imageName = buffer.toString('ucs2', imageNamePtr, imageNamePtr + imageNameLength);

          console.log('Processo:', imageName);

          if (nextEntryOffset === 0) {
            break;
          }
          offset += nextEntryOffset;
        }
      } else {
        console.error('Erro ao chamar NtQuerySystemInformation:', status);
      }
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