#include <string>
#include <unordered_map>
#include <vector>

struct ModuleNode {
  std::string id;
  std::vector<std::string> deps;
};

struct Graph {
  std::unordered_map<std::string, ModuleNode> nodes;
};

Graph create_graph() {
  Graph g;
  return g;
}
