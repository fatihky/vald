import * as assert from 'assert'
import {Map} from 'immutable'
import {isValid, notValid} from '../src/test-utils'
import vald, {SchemaBase, IValidator, ValidatorInsertType, ValidationStepResultOp, IValidationStepResult} from '../src'

describe('modify steps on validation', () => {
  const genStepModifier = (append: boolean) => {
    return (value, param): IValidationStepResult => {
      return {
        op: append
          ? ValidationStepResultOp.APPEND_STEP
          : ValidationStepResultOp.PREPEND_STEP,
        value,
        step: {
          baseName: 'string',
          func: validationFunction,
          param,
          insertType: ValidatorInsertType.TAIL
        }
      }
    }
  }

  const validationFunction = (value, param): IValidationStepResult => {
    return {
      op: ValidationStepResultOp.CONTINUE,
      value: param,
      error: null
    }
  }

  const stringSchemaExtended = new SchemaBase(Map<string, IValidator>()
    .set('appendStep', {
      insertType: ValidatorInsertType.TAIL,
      func: genStepModifier(true)
    })
    .set('prependStep', {
      insertType: ValidatorInsertType.TAIL,
      func: genStepModifier(false)
    })
  )

  const valdExtended = vald
    .extend('string', stringSchemaExtended)

  it('append step', () => {
    const schema = valdExtended
      .base('string')
      .step('appendStep', 'changed value')

    const result = schema.validate('default value')

    isValid(result)
    assert(result.value === 'changed value')
  })

  it('prepend step', () => {
    const schema = valdExtended
      .base('string')
      .step('prependStep', 'changed value')

    const result = schema.validate('default value')

    isValid(result)
    assert(result.value === 'changed value')
  })

  it('combine append and prepend', () => {
    const schema = valdExtended
      .base('string')
      .step('prependStep', 'changed by prependStep')
      .step('appendStep', 'changed by appendStep')

    const result = schema.validate('default value')

    isValid(result)
    assert(result.value === 'changed by appendStep')
  })
})
