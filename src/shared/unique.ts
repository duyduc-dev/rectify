const createRectifyIdInstance = (prefix = "__") => {
  let id = 0;

  const createId = () => prefix + ++id + "__";

  return { createId };
};

export { createRectifyIdInstance };
