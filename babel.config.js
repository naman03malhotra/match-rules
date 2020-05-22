const presets = [];

if (process.env.BABEL_ENV === "node") {
  presets.push("@babel/preset-env");
}

module.exports = { presets };
