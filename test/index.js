'use strict';

const headers = require('../');

const testHeaders = (tHeaders, accept, contentType, set, next) => {
  tHeaders(
    {
      get(key) {
        if (key === 'accept') {
          return accept;
        }
        return contentType;
      },
    },
    { set },
    next);
};

module.exports = {
  invalidExtensions(test) {
    test.expect(1);

    test.throws(() => {
      headers('foo');
    }, 'Invalid supported extensions allowed.');

    test.done();
  },
  emptyHeaders(test) {
    test.expect(1);
    const tHeaders = headers();

    testHeaders(
      tHeaders,
      undefined,
      undefined,
      (key, val) => {
        test.equal(val, 'application/vnd.api+json');
      },
      test.done);
  },
  undefinedAccept(test) {
    test.expect(1);
    const tHeaders = headers();
    testHeaders(
      tHeaders,
      '*/*; charset=test',
      undefined,
      (key, val) => {
        test.equal(val, 'application/vnd.api+json');
      },
      test.done);
  },
  mixexValidAccept(test) {
    test.expect(1);
    const tHeaders = headers();
    testHeaders(
      tHeaders,
      'application/vnd.api+json,application/vnd.api+json; charset=test',
      undefined,
      (key, val) => {
        test.equal(val, 'application/vnd.api+json');
      },
      test.done);
  },
  invalidAccept(test) {
    test.expect(1);
    const tHeaders = headers();
    testHeaders(
      tHeaders,
      'application/vnd.api+json; charset=test',
      undefined,
      test.done,
      (err) => {
        test.equal(err.status, 406, 'Unexpected error code.');
        test.done();
      });
  },
  invalidParameters(test) {
    test.expect(1);
    const tHeaders = headers();
    testHeaders(
      tHeaders,
      undefined,
      'application/vnd.api+json; charset=test',
      test.done,
      (err) => {
        test.equal(err.status, 415, 'Unexpected error code.');
        test.done();
      });
  },
  withExtensions: {
    setUp(cb) {
      this.tHeaders = headers(['bulk', 'jsonpatch']);
      cb();
    },
    invalidExtensions(test) {
      test.expect(1);
      testHeaders(
        this.tHeaders,
        'application/vnd.api+json; ext=test',
        undefined,
        test.done,
        (err) => {
          test.equal(err.status, 406, 'Unexpected error code.');
          test.done();
        });
    },
    emptyAccept(test) {
      test.expect(1);

      testHeaders(
        this.tHeaders,
        'application/vnd.api+json',
        undefined,
        (key, val) => {
          test.equal(val, 'application/vnd.api+json; supported-ext="bulk,jsonpatch"');
        },
        test.done);
    },
    singleAccept(test) {
      test.expect(1);

      testHeaders(
        this.tHeaders,
        'application/vnd.api+json; ext=bulk',
        undefined,
        (key, val) => {
          test.equal(val, 'application/vnd.api+json; ext=bulk; supported-ext="bulk,jsonpatch"');
        },
        test.done);
    },
    multipleAccept(test) {
      test.expect(1);

      testHeaders(
        this.tHeaders,
        'application/vnd.api+json; ext="jsonpatch,bulk"',
        undefined,
        (key, val) => {
          // eslint-disable-next-line max-len
          test.equal(val, 'application/vnd.api+json; ext="jsonpatch,bulk"; supported-ext="bulk,jsonpatch"');
        },
        test.done);
    },
    mixedHeaders(test) {
      test.expect(1);

      testHeaders(
        this.tHeaders,
        'application/vnd.api+json; ext="bulk,jsonpatch"',
        'application/vnd.api+json; ext=jsonpatch',
        (key, val) => {
          // eslint-disable-next-line max-len
          test.equal(val, 'application/vnd.api+json; ext="bulk,jsonpatch"; supported-ext="bulk,jsonpatch"');
        },
        test.done);
    },
    invalidMixedHeaders(test) {
      test.expect(1);

      testHeaders(
        this.tHeaders,
        'application/vnd.api+json; ext=bulk',
        'application/vnd.api+json; ext=jsonpatch',
        test.done,
        (err) => {
          test.equal(err.status, 406, 'Unexpected error code.');
          test.done();
        });
    },
    duplicatedHeaders(test) {
      test.expect(1);

      testHeaders(
        this.tHeaders,
        'application/vnd.api+json; ext=bulk',
        'application/vnd.api+json; ext=bulk',
        (key, val) => {
          test.equal(val, 'application/vnd.api+json; ext=bulk; supported-ext="bulk,jsonpatch"');
        },
        test.done);
    },
  },
};

