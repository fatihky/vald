import vald from '../src/index'
import {isValid, notValid} from '../src/test-utils'

describe('concat', () => {
  it('basic', () => {
    // try to concat multiple tests
    const schema = vald
      .base('string')
      .step('json')
      .base('object')

    isValid(schema.validate('{}'))
    notValid(schema.validate('[]'))
  })
})
