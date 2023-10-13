#include "calc.h"
#include <Windows.h>

void openCalculator() {
    ShellExecuteW(NULL, L"open", L"calc.exe", NULL, NULL, SW_SHOWNORMAL);
}