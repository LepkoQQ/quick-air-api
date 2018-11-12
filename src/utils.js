const caught = fn => (...args) => fn(...args).catch(args[2]);

module.exports = {
  caught,
};
