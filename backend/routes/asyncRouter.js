const express = require('express');
const asyncHandler = require('../middleWare/asyncHandler');

const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

module.exports = () => {
  const router = express.Router();

  METHODS.forEach((method) => {
    const original = router[method];
    router[method] = function (path, ...handlers) {
      const safeHandlers = handlers.map((handler) =>
        typeof handler === 'function' ? asyncHandler(handler) : handler
      );
      return original.call(this, path, ...safeHandlers);
    };
  });

  return router;
};
