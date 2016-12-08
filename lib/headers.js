'use strict';

const _ = require('lodash');
const contentType = require('content-type');
const createError = require('http-errors');

const acceptRE = /(.+".+"[^,]*|[^,]+)/;

module.exports = (supportedExt = []) => {
  if (!Array.isArray(supportedExt)) {
    throw new Error('Supported extensions must be an array.');
  }

  const setCT = (resCT, header) => {
    const ct = contentType.parse(header);

    // If any additional media type parameters are passed, return a
    // 415.
    // http://jsonapi.org/format/#content-negotiation-servers
    if (Object.keys(_.omit(ct.parameters, 'ext')).length) {
      throw createError(415);
    }

    // If the ext media type parameter is set but is using an unsupported
    // extension, return a 406.
    // http://jsonapi.org/extensions/#extension-negotiation
    if (ct.parameters.ext) {
      const ext = ct.parameters.ext.split(',');
      if (_.difference(ext, supportedExt).length) {
        throw createError(406);
      }

      // If the accept and content-type headers disagree on what they
      // support, return a 406.
      if (resCT.parameters.ext && _.difference(ext, resCT.parameters.ext).length) {
        throw createError(406);
      }
      // eslint-disable-next-line no-param-reassign
      resCT.parameters.ext = _.uniq((resCT.parameters.ext || []).concat(ext));
    }
  };

  return (req, res, next) => {
    const resCT = {
      type: 'application/vnd.api+json',
      parameters: {},
    };

    if (supportedExt.length) {
      resCT.parameters['supported-ext'] = supportedExt;
    }

    try {
      const accept = req.get('accept');
      if (accept) {
        const matches = accept.match(acceptRE);
        matches.shift();
        const errs = [];
        let count = 0;
        matches.forEach((val) => {
          if (val.indexOf('application/vnd.api+json') !== -1) {
            count += 1;
            try {
              setCT(resCT, val);
            }
            catch (e) {
              errs.push(e);
            }
          }
        });

        // If all instances of the JSON API accept header are modified, throw a
        // 406 error.
        if (count && count === errs.length) {
          throw createError(406);
        }
      }

      const reqCT = req.get('content-type');
      if (reqCT) {
        setCT(resCT, reqCT);
      }
    }
    catch (e) {
      return next(e);
    }

    if (resCT.parameters.ext) {
      // eslint-disable-next-line no-param-reassign
      req.ext = resCT.parameters.ext;
    }
    res.set('content-type', contentType.format(resCT));

    return next();
  };
};

