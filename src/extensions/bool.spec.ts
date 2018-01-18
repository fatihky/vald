import vald from '../'
import {isValid, notValid} from "../test-utils";

describe('bool', () => {
  it('basic', () => {
    const schema = vald.base('bool')

    isValid(schema.validate(true))
    isValid(schema.validate(false))
    notValid(schema.validate(null))
    notValid(schema.validate('foo'))
    notValid(schema.validate(undefined))
    notValid(schema.validate(() => {}))
    notValid(schema.validate([]))
    notValid(schema.validate({}))
  })
})
