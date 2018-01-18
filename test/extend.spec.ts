import * as assert from 'assert'
import {Map} from 'immutable'
import {isValid, notValid} from '../src/test-utils'
import vald, {SchemaBase, IValidator, ValidatorInsertType, ValidationStepResultOp} from '../src'

describe('extend', () => {
  it('basic', () => {
    const NUMBER_LIST_REGEX = /^(\d+)(,\d+)*$/
    const exendStringMethods = new SchemaBase(Map<string, IValidator>())
      .set('numberList', {
        insertType: ValidatorInsertType.TAIL,
        func: (value: string, param) => {
          if (NUMBER_LIST_REGEX.test(value)) {
            return {
              op: ValidationStepResultOp.CONTINUE,
              value: value.split(','),
              error: null,
            }
          }

          return {
            op: ValidationStepResultOp.CONTINUE,
            value,
            error: new Error('invalid number list format'),
          }
        },
      })
    const schema = vald
      .extend('string', exendStringMethods)
      .base('string')
      .step('numberList')

    const result = schema.validate('1,2,3')
    isValid(result)
    assert.deepEqual(result.value, [1, 2, 3])

    notValid(schema.validate('1-2-3'))
  })
})
