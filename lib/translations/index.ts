import { en } from './en'
import { ar } from './ar'
import { es } from './es'
import { fr } from './fr'
import { zh } from './zh'
import { de } from './de'
import { tr } from './tr'
import { hi } from './hi'

export const translations = {
  EN: en,
  AR: ar,
  ES: es,
  FR: fr,
  ZH: zh,
  DE: de,
  TR: tr,
  HI: hi,
}

export type LanguageCode = keyof typeof translations
export type Translation = typeof en
