import vald, {IValidator, SchemaBase, ValidationStepResultOp, ValidatorInsertType} from '../src'
import {isValid, notValid} from '../src/test-utils'
import {Map} from 'immutable'

const exendAnyMethods = new SchemaBase(Map<string, IValidator>())
  .set('bypassValidation', {
    insertType: ValidatorInsertType.HEAD,
    func: (value: string, param) => {
      return {
        op: ValidationStepResultOp.BYPASS_VALIDATION,
        value
      }
    },
  })
  .set('alwaysInvalid', {
    insertType: ValidatorInsertType.TAIL,
    func: (value: string, param) => {
      return {
        op: ValidationStepResultOp.CONTINUE,
        value,
        error: new Error('invalid number list format'),
      }
    },
  })

describe('insert types', () => {
  it('pre setup', () => {
    const schema = vald.base('string')

    notValid(schema.validate())
    isValid(schema.step('optional').validate()) // optional will run before the setup
  })

  it('after setup', () => {
    const schema = vald
      .extend('any', exendAnyMethods)
      .base('any')
      .step('alwaysInvalid')

    notValid(schema.validate('foo'))

    isValid(schema.step('bypassValidation').validate('foo'))
  })
})
