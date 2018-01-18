import vald from '../'
import {isValid, notValid} from "../test-utils";

describe('string', () => {
  it('basic', () => {
    const schema = vald.base('string')

    isValid(schema.validate(''))
    notValid(schema.validate(null))
    notValid(schema.validate(undefined))
    notValid(schema.validate(() => {}))
    notValid(schema.validate([]))
    notValid(schema.validate({}))
  })

  it('.regex()', () => {
    const schema = vald
      .base('string')
      .step('regex', /\w\d+/)

    notValid(schema.validate({})) // not a string
    notValid(schema.validate('aa')) // not a valid string
    isValid(schema.validate('a1')) // valid string
  })

  it('.json()', () => {
    const schema = vald.base('string').step('json')
    isValid(schema.validate('[]'))
    isValid(schema.validate('{}'))
    isValid(schema.validate('""'))
    isValid(schema.validate('123'))
  })
})
