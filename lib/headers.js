var _ = require('lodash');
var contentType = require('content-type');
var createError = require('http-errors');

module.exports = function (supportedExt) {
  supportedExt = supportedExt || [];
  if (!Array.isArray(supportedExt)) {
    throw new Error('Supported extensions must be an array.');
  }

  var setCT = function (resCT, header) {
    var ct = contentType.parse(header);

    // If any additional media type parameters are passed, return a
    // 415.
    // http://jsonapi.org/format/#content-negotiation-servers
    if (_.keys(_.omit(ct.parameters, 'ext')).length) {
      throw createError(415);
    }

    // If the ext media type parameter is set but is using an unsupported
    // extension, return a 406.
    // http://jsonapi.org/extensions/#extension-negotiation
    if (ct.parameters.ext) {
      var ext = ct.parameters.ext.split(',');
      var diff = _.difference(ext, supportedExt);
      if (diff.length) {
        throw createError(406);
      }
      resCT.parameters.ext = _.uniq((resCT.parameters.ext || []).concat(ext));
    }
  };

  return function (req, res, next) {
    var resCT = {
      type: 'application/vnd.api+json',
      parameters: {}
    };

    if (supportedExt.length) {
      resCT.parameters['supported-ext'] = supportedExt.join(',');
    }

    try {
      var accept = req.get('accept');
      var reqCT = req.get('content-type');
      if (!accept) {
        return next(createError(406));
      }
      setCT(resCT, req.get('accept'));
      if (reqCT) {
        setCT(resCT, req.get('content-type'));
      }
    }
    catch (e) {
      return next(e);
    }

    if (resCT.parameters.ext) {
      req.ext = resCT.parameters.ext;
    }
    res.set('content-type', contentType.format(resCT));

    next();
  };
};

