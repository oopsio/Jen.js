#include <iostream>
#include <string>

int main(int argc, char** argv) {
  std::cout << "C++ bundler stub running\n";
  std::cout << "Args:\n";
  for (int i = 0; i < argc; i++) {
    std::cout << "  [" << i << "] " << argv[i] << "\n";
  }
  return 0;
}
