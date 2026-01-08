'use strict'

import { gurpslink } from '../module/utilities/gurpslink.js'
import { atou, utoa } from './utilities.js'

export const rollableTypes = [
  'attribute',
  'skill-spell',
  'attack',
  'attackdamage',
  'weapon-parry',
  'weapon-block',
  'controlroll',
  'roll',
  'damage',
  'derivedroll',
  'deriveddamage',
  'chat',
] as const

export type RollableType = (typeof rollableTypes)[number]

export interface ExtractedOtf {
  formula: string
  text: string
  encodedAction: string
}

interface ParsedAction {
  action?: GurpsAction
  text: string
}

export function extractOtfs(text: string): ExtractedOtf[] {
  if (!text) return []

  const actions = gurpslink(text, true) as ParsedAction[]

  return actions
    .filter(action => action.action && rollableTypes.includes(action.action.type as RollableType))
    .map(action => {
      let actionData = action.action!
      const dataActionMatch = action.text.match(/data-action='([^']+)'/)
      if (dataActionMatch) {
        actionData = JSON.parse(atou(dataActionMatch[1]))
      }

      let displayText = ''

      if (actionData.overridetxt) {
        displayText = actionData.overridetxt as string
      } else if (
        actionData.type === 'skill-spell' ||
        actionData.type === 'attack' ||
        actionData.type === 'attackdamage' ||
        actionData.type === 'weapon-parry' ||
        actionData.type === 'weapon-block'
      ) {
        displayText = (actionData.name as string) || ''
      } else if (actionData.type === 'attribute') {
        displayText = (actionData.attribute as string) || ''
      } else if (actionData.type === 'controlroll') {
        displayText = (actionData.desc as string) || ''
      } else if (actionData.type === 'chat') {
        displayText = 'Action'
      }

      let fullFormula = actionData.orig as string
      if (actionData.overridetxt) {
        fullFormula = `"${actionData.overridetxt}" ${actionData.orig}`
      }

      return {
        formula: fullFormula,
        text: displayText,
        encodedAction: utoa(JSON.stringify(actionData)),
      }
    })
}
