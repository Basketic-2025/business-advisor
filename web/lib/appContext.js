const context = {};

export function setContext(values) {
  Object.assign(context, values);
}

export function getContext() {
  return context;
}
