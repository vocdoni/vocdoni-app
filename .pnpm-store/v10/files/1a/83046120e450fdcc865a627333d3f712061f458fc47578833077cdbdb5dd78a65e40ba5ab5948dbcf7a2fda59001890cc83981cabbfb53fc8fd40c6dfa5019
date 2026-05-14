"use strict";
const findCompositionById = (compositions, id) => {
  return compositions.find((comp) => comp.id === id);
};
const getFileDependencies = (compositions, id) => {
  const composition = findCompositionById(compositions, id);
  if (!composition) return [];
  const fileDependencies = /* @__PURE__ */ new Set();
  composition.fileDependencies.forEach((dep) => {
    fileDependencies.add(dep.replace("compositions/ui/", ""));
  });
  const npmDependencies = new Set(composition.npmDependencies);
  const collect = (id2) => {
    const comp = findCompositionById(
      compositions,
      id2.replace("compositions/ui/", "")
    );
    if (!comp) return;
    comp.npmDependencies.forEach((dep) => {
      npmDependencies.add(dep);
    });
    comp.fileDependencies.forEach((dep) => {
      if (fileDependencies.has(dep)) return;
      fileDependencies.add(dep.replace("compositions/ui/", ""));
      collect(dep);
    });
  };
  collect(id);
  return {
    fileDependencies: Array.from(fileDependencies),
    npmDependencies: Array.from(npmDependencies)
  };
};

export { findCompositionById, getFileDependencies };
