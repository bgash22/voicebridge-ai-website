import { en } from './en'
import { ar } from './ar'
import { es } from './es'
import { fr } from './fr'
import { zh } from './zh'

export const translations = {
  EN: en,
  AR: ar,
  ES: es,
  FR: fr,
  ZH: zh,
}

export type LanguageCode = keyof typeof translations
export type Translation = typeof en
