import * as assert from 'assert'
import vald from '../'
import {isValid, notValid} from "../test-utils";

describe('object', () => {
  it('basic', () => {
    const schema = vald.base('object')

    isValid(schema.validate({}))
    notValid(schema.validate(null))
    notValid(schema.validate(undefined))
    notValid(schema.validate(() => {}))
    notValid(schema.validate([]))
    notValid(schema.validate('str'))
  })

  it('.keys()', () => {
    const schema = vald
      .base('object')
      .step('keys', {
        foo: vald.base('any').step('required')
      })

    notValid(schema.validate({}))
    isValid(schema.validate({foo: 'bar'}))
  })
})
