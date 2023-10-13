#include <windows.h>
#include <stdio.h>

#define EXPORT __declspec(dllexport)

EXPORT void inject(char* program, char* dllName) {
    HANDLE procHandle;
    LPVOID allocMemAddress;
    LPVOID loadLibraryAddr;
    SIZE_T bytesWritten;

    // Obter o identificador do processo com as permissões necessárias
    procHandle = OpenProcess(PROCESS_CREATE_THREAD | PROCESS_QUERY_INFORMATION | PROCESS_VM_OPERATION | PROCESS_VM_WRITE | PROCESS_VM_READ, FALSE, atoi(program));

    // Obter o endereço de LoadLibraryA da biblioteca do sistema
    loadLibraryAddr = (LPVOID)GetProcAddress(GetModuleHandle("kernel32.dll"), "LoadLibraryA");

    // Alocar memória no processo de destino
    allocMemAddress = VirtualAllocEx(procHandle, NULL, strlen(dllName) + 1, MEM_COMMIT | MEM_RESERVE, PAGE_READWRITE);

    // Escrever o nome da DLL na memória alocada no processo de destino
    WriteProcessMemory(procHandle, allocMemAddress, dllName, strlen(dllName) + 1, &bytesWritten);

    // Criar uma thread remota para chamar LoadLibraryA com o endereço do nome da DLL como argumento
    CreateRemoteThread(procHandle, NULL, 0, (LPTHREAD_START_ROUTINE)loadLibraryAddr, allocMemAddress, 0, NULL);
}
