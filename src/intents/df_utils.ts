import { Effect } from "../@types/cerebro"

/*
 * Copyright (C) 2021 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster/rox
 *
 * This file is part of Rox
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *    https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export function getRamdomValue(values: Record<string, string>[]) {
  return values[Math.floor(Math.random() * values.length)]
}

export function convertToSayEffect(rawEffect: Record<string, any>): Effect {
  const r = getRamdomValue(
    rawEffect.payload.fields
      .parameters.structValue.fields.responses.listValue.values)
  return {
    type: rawEffect.payload.fields.effect.stringValue,
    parameters: {
      response: r.stringValue
    }
  }
}

export function convertToSendDataEffect(rawEffect: Record<string, any>): Effect {
  const fields =  rawEffect.payload.fields.parameters.structValue.fields
  const parameters = {
    type: fields.type.stringValue,
    icon: fields.icon.stringValue,
    link: fields.link.stringValue
  }
  return {
    type: rawEffect.payload.fields.effect.stringValue,
    parameters
  }
}
