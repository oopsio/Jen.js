#include <string>
#include <vector>

struct ASTNode {
  std::string kind;
};

ASTNode parse(const std::vector<std::string>& tokens) {
  ASTNode n;
  n.kind = "Program";
  return n;
}
