# JSON API Headers

[![Build Status](https://travis-ci.org/elliotttf/jsonapi-headers.svg?branch=master)](https://travis-ci.org/elliotttf/jsonapi-headers)
[![Coverage Status](https://coveralls.io/repos/elliotttf/jsonapi-headers/badge.svg?branch=master&service=github)](https://coveralls.io/github/elliotttf/jsonapi-headers?branch=master)

This module validates incoming headers and adds outgoing headers for
JSON API based systems. In additon to basic [content negotiation](http://jsonapi.org/format/#content-negotiation) this module supports [extension negotiation](http://jsonapi.org/extensions/#extension-negotiation).

## Usage

```javascript
// Without extension support.
app.use(require('jsonapi-headers')());

// OR With extension support.
app.use(require('jsonapi-headers')(['batch', 'jsonpatch']));
```

The resulting middleware will validate `Accept` and `Content-Type` headers
as defined by JSON API and will call `next` with an error if the headers are
invalid (either a `406` or `415` depending on what's wrong).

If there are no validation problems, the `Content-Type` of the response will
be appropriately assigned, e.g.
`application/vnd.api+json; ext=bulk; supported-ext="batch,jsonpatch"`

Additionally, any extensions that the request is supporting will be added as
an array to `req.ext`.

