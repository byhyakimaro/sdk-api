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
    const SystemProcessInformation = 5;
    const STATUS_SUCCESS = 0;

    let bufferSize = 4096;
    let buffer = Buffer.alloc(bufferSize);
    let status;
    do {
      buffer = Buffer.alloc(bufferSize); // Alocando um novo buffer
      status = this.ntdll.NtQuerySystemInformation(SystemProcessInformation, buffer, buffer.length, null);

      if (status === STATUS_SUCCESS) {
        let offset = 0;
        do {
          const imageNameLength = buffer.readUInt16LE(offset + 0x38);
          const processName = buffer.toString('ucs2', offset + 0x40, offset + 0x40 + imageNameLength);
          
          console.log('Processo encontrado:', processName);
          
          const nextEntryOffset = buffer.readUInt32LE(offset);
          offset += nextEntryOffset;
        } while (offset !== 0);
        break; // Sair do loop, pois obtivemos as informações com sucesso
      } else if (status === 0xC0000004) {
        // STATUS_INFO_LENGTH_MISMATCH, aumente o tamanho do buffer
        bufferSize *= 2;
      } else {
        console.error('Erro ao chamar NtQuerySystemInformation:', status);
        break; // Sair do loop em caso de outro erro
      }
    } while (status === 0xC0000004);
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