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

    const bufferSize = 1024 * 1024; // Tamanho do buffer, ajuste conforme necessário
    const buffer = Buffer.alloc(bufferSize);
    const returnLength = Buffer.alloc(ref.types.uint32.size);
    returnLength.writeUInt32LE(0);

    const status = this.ntdll.NtQuerySystemInformation(SystemProcessInformation, buffer, bufferSize, returnLength);

    if (status === STATUS_SUCCESS) {
      let offset = 0;

      do {
        const nextEntryOffset = buffer.readUInt32LE(offset);
        const imageNameBuffer = buffer.slice(offset + ref.types.uint32.size, offset + ref.types.uint32.size + ref.types.uint32.size);
        const imageNameLength = imageNameBuffer.readUInt32LE(ref.types.uint32.size);
        const processName = imageNameBuffer.toString('ucs2', ref.types.uint32.size, ref.types.uint32.size + imageNameLength);

        if (processName === 'notepad.exe') {
          // Faça algo com o processo 'notepad.exe'
          console.log('Processo encontrado:', processName);
        }

        offset += nextEntryOffset;
      } while (offset !== 0);
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