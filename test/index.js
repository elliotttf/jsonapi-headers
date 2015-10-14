var headers = require('../');

var testHeaders = function (tHeaders, accept, contentType, set, next) {
  tHeaders(
    {
      get: function (key) {
        if (key === 'accept') {
          return accept;
        }
        return contentType;
      }
    },
    {set: set},
    next
  );
};

module.exports = {
  invalidExtensions: function (test) {
    test.expect(1);

    test.throws(function () {
      headers('foo');
    }, 'Invalid supported extensions allowed.');

    test.done();
  },
  emptyHeaders: function (test) {
    test.expect(1);
    var tHeaders = headers();

    testHeaders(
      tHeaders,
      undefined,
      undefined,
      function (key, val) {
        test.equal(val, 'application/vnd.api+json');
      },
      test.done
    );
  },
  undefinedAccept: function (test) {
    test.expect(1);
    var tHeaders = headers();
    testHeaders(
      tHeaders,
      '*/*; charset=test',
      undefined,
      function (key, val) {
        test.equal(val, 'application/vnd.api+json');
      },
      test.done
    );
  },
  mixexValidAccept: function (test) {
    test.expect(1);
    var tHeaders = headers();
    testHeaders(
      tHeaders,
      'application/vnd.api+json,application/vnd.api+json; charset=test',
      undefined,
      function (key, val) {
        test.equal(val, 'application/vnd.api+json');
      },
      test.done
    );
  },
  invalidAccept: function (test) {
    test.expect(1);
    var tHeaders = headers();
    testHeaders(
      tHeaders,
      'application/vnd.api+json; charset=test',
      undefined,
      test.done,
      function (err) {
        test.equal(err.status, 406, 'Unexpected error code.');
        test.done();
      }
    );
  },
  invalidParameters: function (test) {
    test.expect(1);
    var tHeaders = headers();
    testHeaders(
      tHeaders,
      undefined,
      'application/vnd.api+json; charset=test',
      test.done,
      function (err) {
        test.equal(err.status, 415, 'Unexpected error code.');
        test.done();
      }
    );
  },
  withExtensions: {
    setUp: function (cb) {
      this.tHeaders = headers(['bulk', 'jsonpatch']);
      cb();
    },
    invalidExtensions: function (test) {
      test.expect(1);
      testHeaders(
        this.tHeaders,
        'application/vnd.api+json; ext=test',
        undefined,
        test.done,
        function (err) {
          test.equal(err.status, 406, 'Unexpected error code.');
          test.done();
        }
      );
    },
    emptyAccept: function (test) {
      test.expect(1);

      testHeaders(
        this.tHeaders,
        'application/vnd.api+json',
        undefined,
        function (key, val) {
          test.equal(val, 'application/vnd.api+json; supported-ext="bulk,jsonpatch"');
        },
        test.done
      );
    },
    singleAccept: function (test) {
      test.expect(1);

      testHeaders(
        this.tHeaders,
        'application/vnd.api+json; ext=bulk',
        undefined,
        function (key, val) {
          test.equal(val, 'application/vnd.api+json; ext=bulk; supported-ext="bulk,jsonpatch"');
        },
        test.done
      );
    },
    multipleAccept: function (test) {
      test.expect(1);

      testHeaders(
        this.tHeaders,
        'application/vnd.api+json; ext="jsonpatch,bulk"',
        undefined,
        function (key, val) {
          test.equal(val, 'application/vnd.api+json; ext="jsonpatch,bulk"; supported-ext="bulk,jsonpatch"');
        },
        test.done
      );
    },
    mixedHeaders: function (test) {
      test.expect(1);

      testHeaders(
        this.tHeaders,
        'application/vnd.api+json; ext="bulk,jsonpatch"',
        'application/vnd.api+json; ext=jsonpatch',
        function (key, val) {
          test.equal(val, 'application/vnd.api+json; ext="bulk,jsonpatch"; supported-ext="bulk,jsonpatch"');
        },
        test.done
      );
    },
    invalidMixedHeaders: function (test) {
      test.expect(1);

      testHeaders(
        this.tHeaders,
        'application/vnd.api+json; ext=bulk',
        'application/vnd.api+json; ext=jsonpatch',
        test.done,
        function (err) {
          test.equal(err.status, 406, 'Unexpected error code.');
          test.done();
        }
      );
    },
    duplicatedHeaders: function (test) {
      test.expect(1);

      testHeaders(
        this.tHeaders,
        'application/vnd.api+json; ext=bulk',
        'application/vnd.api+json; ext=bulk',
        function (key, val) {
          test.equal(val, 'application/vnd.api+json; ext=bulk; supported-ext="bulk,jsonpatch"');
        },
        test.done
      );
    }
  }
};

