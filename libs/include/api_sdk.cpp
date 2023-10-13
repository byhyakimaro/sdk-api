#include <node_api.h>
#include <windows.h>

napi_value ShellExecuteWrapper(napi_env env, napi_callback_info info) {
  size_t argc = 2;
  napi_value args[2];
  napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

  char command[256];
  size_t commandLength;
  napi_get_value_string_utf8(env, args[0], command, sizeof(command), &commandLength);

  char parameters[256];
  size_t parametersLength;
  napi_get_value_string_utf8(env, args[1], parameters, sizeof(parameters), &parametersLength);

  HINSTANCE result = ShellExecuteA(nullptr, "open", command, parameters, nullptr, SW_SHOWNORMAL);
  napi_value returnValue;
  napi_create_int32(env, (int)result, &returnValue);
  return returnValue;
}

napi_value Init(napi_env env, napi_value exports) {
  napi_property_descriptor desc = { "shellExecute", 0, ShellExecuteWrapper, 0, 0, 0, napi_default, 0 };
  napi_define_properties(env, exports, 1, &desc);
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)