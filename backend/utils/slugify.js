// simple slugify util: lowercase, replace non-alnum with hyphen, collapse hyphens
module.exports = function slugify(input) {
  if (!input) return '';
  return String(input)
    .toLowerCase()
    .replace(/@/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
};
