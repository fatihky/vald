import * as assert from 'assert'
import Schema from './schema'
import vald from './index'
import {ISchema} from './types'

describe('schema', () => {
  it('_findLastOccurenceOfStepGroupHead()', () => {
    const lastOccurence = Schema._findLastOccurenceOfStepGroupHead
    const compare = (a, b) => a === b

    assert.equal(lastOccurence([1, 0], 0, compare), 1)
    assert.equal(lastOccurence([1, 0, 0], 0, compare), 1)
    assert.equal(lastOccurence([1, 0, 0, 1], 0, compare), 4)
  })

  it ('pass new schema to the step modifier functions', () => {
    // .when runs pre setup
    // .required also runs at pre setup
    // .min should be never called because required will already be called
    const schema = vald.base('object').step('keys', {
      foo: vald.base('string'),
      baz: vald.base('string')
        .step('when', {
          path: 'foo',
          is: 'bar',
          then: (value, schema: ISchema, ctx) => schema.step('required'),
        })
        .step('when', {
          path: 'foo',
          is: 'bar',
          then: (value, schema: ISchema, ctx) => schema.step('min', 2),
        }),
    })

    assert(schema.validate({
      foo: 'bar',
      baz: ''
    }).error.message.includes('required'))
  })
})
