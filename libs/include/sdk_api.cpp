#include <node_api.h>
#include <windows.h>

napi_value MyFunction(napi_env env, napi_callback_info info) {
  napi_value result;
  napi_create_int32(env, 42, &result); // Um exemplo de valor de retorno (substitua conforme necessário)
  return result;
}

napi_value Init(napi_env env, napi_value exports) {
  napi_property_descriptor desc = { "myFunction", 0, MyFunction, 0, 0, 0, napi_default, 0 };
  napi_define_properties(env, exports, 1, &desc);
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)