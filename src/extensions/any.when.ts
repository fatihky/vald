import * as _ from 'lodash'
import {
  ISchema,
  IValidationContext,
  IValidationStepResult,
  IValidator,
  ValidatorInsertType,
  ValidationStepResultOp,
} from '../types'

const compareEqEqEq = (x, y) => x === y

const appendSchema = (schema: ISchema, value: any): IValidationStepResult => {
  return {
    op: schema === null
      ? ValidationStepResultOp.CONTINUE
      : ValidationStepResultOp.MODIFY_SCHEMA,
    value,
    schema: schema
  }
}

type SchemaModifier = (value: any, schema: ISchema, ctx: IValidationContext) => ISchema

interface Params {
  path: string,
  is: any | Function,
  then: SchemaModifier,
  otherwise: SchemaModifier
}

const when: IValidator = {
  insertType: ValidatorInsertType.PRE_SETUP,
  func: (value, param: Params, ctx: IValidationContext, schema: ISchema): IValidationStepResult => {
    const {
      path,
      is,
      then = null,
      otherwise = null
    } = param

    const rval = ctx.resolve(path)
    let lval = is
    let compare: Function = compareEqEqEq

    if (_.isFunction(lval)) {
      compare = lval
      lval = undefined
    }

    if (compare(rval, lval)) {
      return appendSchema(then === null
        ? null
        : then(value, schema, ctx), value)
    }

    return appendSchema(otherwise === null
      ? null
      : otherwise(value, schema, ctx), value)
  }
}

export default when

