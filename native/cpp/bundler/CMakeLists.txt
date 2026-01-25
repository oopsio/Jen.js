cmake_minimum_required(VERSION 3.16)
project(framework_bundler)

set(CMAKE_CXX_STANDARD 20)

add_executable(framework_bundler
  src/main.cpp
  src/fs.cpp
  src/graph.cpp
  src/lexer.cpp
  src/parser.cpp
  src/emitter.cpp
)
