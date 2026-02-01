import lightningcss from "bun-lightningcss";

// Workaround for CSS Modules bug in Bun
// See: https://github.com/oven-sh/bun/issues/18258
export default lightningcss();
