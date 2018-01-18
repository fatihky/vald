import * as assert from 'assert'
import Schema from './schema'
import vald from './index'
import {ISchema, ValidationStepResultOp, ValidatorInsertType} from './types'
import {isValid, notValid} from './test-utils'
import stringExtension from './extensions/string'

describe('schema', () => {
  it('_findLastOccurenceOfStepGroupHead()', () => {
    const lastOccurence = Schema._findLastOccurenceOfStepGroupHead
    const compare = (a, b) => a === b

    assert.equal(lastOccurence([1, 0], 0, compare), 1)
    assert.equal(lastOccurence([1, 0, 0], 0, compare), 1)
    assert.equal(lastOccurence([1, 0, 0, 1], 0, compare), 4)
  })

  it('pass new schema to the step modifier functions', () => {
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
      baz: '',
    }).error.message.includes('required'))
  })

  describe('ValidatorInsertType', () => {
    // PRE_SETUP: last run first
    it('PRE_SETUP', () => {
      // optional and required functions are run at PRE_SETUP state
      const schema = vald.base('string').step('optional').step('required')

      // required should be called before optional so undefined will be invalid
      notValid(schema.validate())
      // schema should put '.optional()' validation function to head
      isValid(schema.step('optional').validate())
    })

    // HEAD: last run first
    it('HEAD', () => {
      const valdExtended = vald.extend('string', stringExtension
        .set('headFirst', {
          insertType: ValidatorInsertType.HEAD,
          func: (value, param, ctx) => {
            return {
              op: ValidationStepResultOp.ERROR,
              error: new Error('head first fail'),
              value,
            }
          },
        })
        .set('headSecond', {
          insertType: ValidatorInsertType.HEAD,
          func: (value, param, ctx) => {
            return {
              op: ValidationStepResultOp.ERROR,
              error: new Error('head second fail'),
              value,
            }
          },
        })
      )

      const schema = valdExtended.base('string').step('headFirst').step('headSecond')

      assert(schema.validate('foo').error.message.includes('second'))
    })
  })
})
