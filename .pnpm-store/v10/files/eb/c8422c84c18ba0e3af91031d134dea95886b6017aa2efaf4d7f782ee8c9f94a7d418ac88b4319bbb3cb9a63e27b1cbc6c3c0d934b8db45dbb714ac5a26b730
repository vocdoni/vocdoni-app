'use client';
function getBranchValues(tree, depth) {
  let values = [];
  tree.visit({
    onEnter: (node, indexPath) => {
      if (indexPath.length === 0) return;
      if (tree.isBranchNode(node) && indexPath.length <= depth) {
        values.push(tree.getNodeValue(node));
      }
    }
  });
  return values;
}

export { getBranchValues };
