const process = require('process');
const sudo = require('sudo-prompt');

const api_sdk = require('./include/build/Release/api_sdk');

class ManagerWin32 {
  constructor() {};

  ShellExecuteWrapper(command) {
    return api_sdk.shellExecute(command)
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
module.exports = ManagerWin32