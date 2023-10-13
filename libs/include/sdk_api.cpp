#include <iostream>

// Exporta a função helloWorld para ser usada por outras aplicações
extern "C" __declspec(dllexport) int getNumber() {
    return 42;
}