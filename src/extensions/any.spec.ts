import vald from '../'
import {isValid, notValid} from "../test-utils";
import {ISchema, IValidationContext} from '../types'

describe('any', () => {
  it('basic setup', () => {
    vald.base('any')
  })

  it('.min()', () => {
    const schema = vald.base('any').step('min', 3)
    isValid(schema.validate('test'))
    notValid(schema.validate('t'))
  })

  describe('.when()', () => {
    it('compare with primitive value', () => {
      const schema = vald
        .base('object')
        .step('keys', {
          bar: vald
            .base('bool'),
          foo: vald
            .base('string')
            .step('when', {
              path: 'bar',
              is: true,
              then(value: any, schema: ISchema, ctx: IValidationContext): ISchema {
                return schema
                  .step('min', 3)
              },
              otherwise(value: any, schema: ISchema, ctx: IValidationContext): ISchema {
                return schema
                  .step('min', 2)
              }
            })
        })

      // THEN - min length: 3
      isValid(schema.validate({
        bar: true,
        foo: 'foo'
      }))

      notValid(schema.validate({
        bar: true,
        foo: 'fo'
      }))

      // OTHERWISE - min length: 2
      isValid(schema.validate({
        bar: false,
        foo: 'fo'
      }))

      notValid(schema.validate({
        bar: false,
        foo: 'f'
      }))
    })
  })

  // check if PRE_SETUP parameter works for the .optional()
  it('step order', () => {
    const schema = vald.base('object').step('keys', {
      foo: vald.base('string'),
      baz: vald.base('string').step('when', {
        path: 'foo',
        is: 'bar',
        then(value: any, schema: ISchema, ctx: IValidationContext) {
          return schema
            .step('optional')
        }
      })
    })

    isValid(schema.validate({
      foo: 'bar',
      // baz is undefined
    }))
  })
})
