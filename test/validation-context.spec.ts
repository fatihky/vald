import {Map} from 'immutable'
import {isValid, notValid} from '../src/test-utils'
import vald, {SchemaBase, IValidator, ValidatorInsertType, ValidationStepResultOp, IValidationContext} from '../src'

describe('validation context', () => {
  const schemaBase = new SchemaBase(Map<string, IValidator>())
    .set('resolvedEqual', {
      insertType: ValidatorInsertType.TAIL,
      func: (value: string, param: any, ctx: IValidationContext) => {
        if (ctx.resolve(param.path) !== param.value) {
          return {
            op: ValidationStepResultOp.ERROR,
            error: new Error('resolved value is not equal to expected'),
            value
          }
        }

        return {
          op: ValidationStepResultOp.CONTINUE,
          value
        }
      },
    })
  const valdExtended = vald
    .extend('object', schemaBase)

  it('.resolve()', () => {
    const schema = valdExtended
      .base('object')
      .step('resolvedEqual', {
        path: 'foo',
        value: 'bar'
      })

    isValid(schema.validate({foo: 'bar'}))
    notValid(schema.validate({foo: 'baz'}))
  })

  it('.resolve() resolve context', () => {
    const schema = valdExtended
      .base('object')
      .step('resolvedEqual', {
        path: '$foo',
        value: 'bar'
      })

    isValid(schema.validate({}, {context: {foo: 'bar'}}))
    notValid(schema.validate({}, {context: {foo: 'baz'}}))
  })
})
